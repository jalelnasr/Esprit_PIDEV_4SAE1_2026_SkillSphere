package com.esprit.examen.servicesImpl;

import com.esprit.examen.dto.SuggestedGroupDTO;
import com.esprit.examen.dto.SuggestedUserDTO;
import com.esprit.examen.entities.Comment;
import com.esprit.examen.entities.Follow;
import com.esprit.examen.entities.Group;
import com.esprit.examen.entities.GroupMember;
import com.esprit.examen.entities.Post;
import com.esprit.examen.entities.PostLike;
import com.esprit.examen.feign.UserFeignClient;
import com.esprit.examen.repositories.CommentRepository;
import com.esprit.examen.repositories.FollowRepository;
import com.esprit.examen.repositories.GroupMemberRepository;
import com.esprit.examen.repositories.GroupRepository;
import com.esprit.examen.repositories.PostLikeRepository;
import com.esprit.examen.repositories.PostRepository;
import com.esprit.examen.services.SuggestionService;
import com.esprit.examen.services.UserService;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class SuggestionServiceImpl implements SuggestionService {

    private static final Pattern HASHTAG_PATTERN = Pattern.compile("#[A-Za-z0-9_]+");
    private static final int MAX_RESULTS = 10;
    private static final int DOMAIN_CHECK_LIMIT = 30;
    private static final int MAX_SIMILAR_USERS_FOR_GROUPS = 2000;

    @Resource
    private FollowRepository followRepository;

    @Resource
    private GroupRepository groupRepository;

    @Resource
    private GroupMemberRepository groupMemberRepository;

    @Resource
    private PostRepository postRepository;

    @Resource
    private PostLikeRepository postLikeRepository;

    @Resource
    private CommentRepository commentRepository;

    @Resource
    private UserService userService;

    @Override
    public List<SuggestedUserDTO> suggestUsersForCurrentUser() {
        Long currentUserId = userService.getCurrentUserId();

        Set<Long> excludedUserIds = new HashSet<>();
        excludedUserIds.add(currentUserId);
        List<Follow> following = followRepository.findByFollowerId(currentUserId);
        following.forEach(follow -> excludedUserIds.add(follow.getFollowingId()));

        Map<Long, UserCandidateScore> userScores = new HashMap<>();
        applySharedGroupsUserScore(currentUserId, excludedUserIds, userScores);
        applySharedHashtagsUserScore(currentUserId, excludedUserIds, userScores);
        applySharedInteractionsUserScore(currentUserId, excludedUserIds, userScores);
        applySameDomainBonus(currentUserId, userScores);

        Comparator<UserCandidateScore> order = Comparator
            .comparingInt((UserCandidateScore candidate) -> candidate.score)
            .reversed()
            .thenComparing(Comparator.comparingInt(UserCandidateScore::signalsCount).reversed())
            .thenComparingLong(candidate -> candidate.userId);

        return userScores.values().stream()
            .filter(candidate -> candidate.score > 0)
            .sorted(order)
            .limit(MAX_RESULTS)
            .map(this::toSuggestedUser)
            .toList();
    }

    @Override
    public List<SuggestedGroupDTO> suggestGroupsForCurrentUser() {
        Long currentUserId = userService.getCurrentUserId();

        Set<Long> joinedGroupIds = groupMemberRepository.findByUserId(currentUserId).stream()
            .map(GroupMember::getGroup)
            .filter(group -> group != null && group.getGroupId() != null)
            .map(Group::getGroupId)
            .collect(Collectors.toSet());

        Map<Long, GroupCandidateScore> groupScores = new HashMap<>();
        for (Group group : groupRepository.findAll()) {
            if (group.getGroupId() == null || joinedGroupIds.contains(group.getGroupId())) {
                continue;
            }

            groupScores.put(group.getGroupId(), new GroupCandidateScore(group));
        }

        if (groupScores.isEmpty()) {
            return List.of();
        }

        applyGroupHashtagScore(currentUserId, groupScores.values());
        applySimilarGroupsScore(currentUserId, joinedGroupIds, groupScores);
        applyTrendingScore(groupScores);
        applyPopularityScore(groupScores);

        Comparator<GroupCandidateScore> order = Comparator
            .comparingInt((GroupCandidateScore candidate) -> candidate.score)
            .reversed()
            .thenComparing(Comparator.comparingInt((GroupCandidateScore candidate) -> candidate.matchedHashtags).reversed())
            .thenComparing(Comparator.comparingInt((GroupCandidateScore candidate) -> candidate.overlapMembers).reversed())
            .thenComparing(Comparator.comparingInt((GroupCandidateScore candidate) -> candidate.recentActivity).reversed())
            .thenComparing(Comparator.comparingLong((GroupCandidateScore candidate) -> candidate.membersCount).reversed())
            .thenComparingLong(candidate -> candidate.groupId);

        return groupScores.values().stream()
            .filter(candidate -> candidate.score > 0)
            .sorted(order)
            .limit(MAX_RESULTS)
            .map(this::toSuggestedGroup)
            .toList();
    }

    private void applySharedGroupsUserScore(
        Long currentUserId,
        Set<Long> excludedUserIds,
        Map<Long, UserCandidateScore> userScores
    ) {
        Set<Long> currentGroupIds = groupMemberRepository.findByUserId(currentUserId).stream()
            .map(GroupMember::getGroup)
            .filter(group -> group != null && group.getGroupId() != null)
            .map(Group::getGroupId)
            .collect(Collectors.toSet());

        if (currentGroupIds.isEmpty()) {
            return;
        }

        Map<Long, Set<Long>> sharedGroupIdsByUser = new HashMap<>();
        for (GroupMember membership : groupMemberRepository.findByGroupGroupIdIn(currentGroupIds)) {
            Long candidateId = membership.getUserId();
            if (candidateId == null || excludedUserIds.contains(candidateId)) {
                continue;
            }

            Group group = membership.getGroup();
            if (group == null || group.getGroupId() == null) {
                continue;
            }

            sharedGroupIdsByUser
                .computeIfAbsent(candidateId, ignored -> new HashSet<>())
                .add(group.getGroupId());
        }

        sharedGroupIdsByUser.forEach((candidateId, sharedGroups) -> {
            UserCandidateScore score = userScores.computeIfAbsent(candidateId, UserCandidateScore::new);
            score.sharedGroups = sharedGroups.size();
            score.score += 3;
        });
    }

    private void applySharedHashtagsUserScore(
        Long currentUserId,
        Set<Long> excludedUserIds,
        Map<Long, UserCandidateScore> userScores
    ) {
        Set<String> currentHashtags = extractHashtagsFromPosts(postRepository.findByUserId(currentUserId));
        if (currentHashtags.isEmpty()) {
            return;
        }

        List<Post> candidatePosts = postRepository.findByContentContainingAndUserIdNotIn("#", excludedUserIds);
        Map<Long, Set<String>> sharedHashtagsByUser = new HashMap<>();

        for (Post post : candidatePosts) {
            Long candidateId = post.getUserId();
            if (candidateId == null || excludedUserIds.contains(candidateId)) {
                continue;
            }

            Set<String> postHashtags = extractHashtags(post.getContent());
            if (postHashtags.isEmpty()) {
                continue;
            }

            postHashtags.retainAll(currentHashtags);
            if (postHashtags.isEmpty()) {
                continue;
            }

            sharedHashtagsByUser
                .computeIfAbsent(candidateId, ignored -> new HashSet<>())
                .addAll(postHashtags);
        }

        sharedHashtagsByUser.forEach((candidateId, sharedHashtags) -> {
            UserCandidateScore score = userScores.computeIfAbsent(candidateId, UserCandidateScore::new);
            score.sharedHashtags = sharedHashtags.size();
            score.score += 2;
        });
    }

    private void applySharedInteractionsUserScore(
        Long currentUserId,
        Set<Long> excludedUserIds,
        Map<Long, UserCandidateScore> userScores
    ) {
        Set<Long> interactedPostIds = new HashSet<>();
        postLikeRepository.findByUserId(currentUserId).forEach(like -> {
            if (like.getPost() != null && like.getPost().getPostId() != null) {
                interactedPostIds.add(like.getPost().getPostId());
            }
        });

        commentRepository.findByUserId(currentUserId).forEach(comment -> {
            if (comment.getPost() != null && comment.getPost().getPostId() != null) {
                interactedPostIds.add(comment.getPost().getPostId());
            }
        });

        if (interactedPostIds.isEmpty()) {
            return;
        }

        List<Long> postIds = new ArrayList<>(interactedPostIds);
        List<Long> excluded = new ArrayList<>(excludedUserIds);
        Map<Long, Set<Long>> sharedInteractionPostsByUser = new HashMap<>();

        for (PostLike like : postLikeRepository.findByPostPostIdInAndUserIdNotIn(postIds, excluded)) {
            if (like.getUserId() == null || like.getPost() == null || like.getPost().getPostId() == null) {
                continue;
            }

            sharedInteractionPostsByUser
                .computeIfAbsent(like.getUserId(), ignored -> new HashSet<>())
                .add(like.getPost().getPostId());
        }

        for (Comment comment : commentRepository.findByPostPostIdInAndUserIdNotIn(postIds, excluded)) {
            if (comment.getUserId() == null || comment.getPost() == null || comment.getPost().getPostId() == null) {
                continue;
            }

            sharedInteractionPostsByUser
                .computeIfAbsent(comment.getUserId(), ignored -> new HashSet<>())
                .add(comment.getPost().getPostId());
        }

        sharedInteractionPostsByUser.forEach((candidateId, sharedPosts) -> {
            UserCandidateScore score = userScores.computeIfAbsent(candidateId, UserCandidateScore::new);
            score.sharedInteractions = sharedPosts.size();
            score.score += 2;
        });
    }

    private void applySameDomainBonus(Long currentUserId, Map<Long, UserCandidateScore> userScores) {
        String currentDomain = resolveEmailDomain(currentUserId);
        if (currentDomain == null || currentDomain.isBlank()) {
            return;
        }

        List<UserCandidateScore> shortlist = userScores.values().stream()
            .sorted(Comparator.comparingInt((UserCandidateScore candidate) -> candidate.score).reversed())
            .limit(DOMAIN_CHECK_LIMIT)
            .toList();

        for (UserCandidateScore candidate : shortlist) {
            String candidateDomain = resolveEmailDomain(candidate.userId);
            if (candidateDomain != null && candidateDomain.equalsIgnoreCase(currentDomain)) {
                candidate.sameDomain = true;
                candidate.score += 1;
            }
        }
    }

    private void applyGroupHashtagScore(Long currentUserId, Collection<GroupCandidateScore> groupScores) {
        Set<String> userHashtags = extractHashtagsFromPosts(postRepository.findByUserId(currentUserId));
        if (userHashtags.isEmpty()) {
            return;
        }

        for (GroupCandidateScore candidate : groupScores) {
            Set<String> groupTags = extractHashtags(candidate.name + " " + candidate.description);
            if (groupTags.isEmpty()) {
                continue;
            }

            groupTags.retainAll(userHashtags);
            if (groupTags.isEmpty()) {
                continue;
            }

            candidate.matchedHashtags = groupTags.size();
            candidate.score += 3;
        }
    }

    private void applySimilarGroupsScore(
        Long currentUserId,
        Set<Long> joinedGroupIds,
        Map<Long, GroupCandidateScore> groupScores
    ) {
        if (joinedGroupIds.isEmpty()) {
            return;
        }

        List<GroupMember> membershipsInJoinedGroups = groupMemberRepository.findByGroupGroupIdIn(joinedGroupIds);
        Set<Long> similarUserIds = membershipsInJoinedGroups.stream()
            .map(GroupMember::getUserId)
            .filter(userId -> userId != null && !userId.equals(currentUserId))
            .limit(MAX_SIMILAR_USERS_FOR_GROUPS)
            .collect(Collectors.toSet());

        if (similarUserIds.isEmpty()) {
            return;
        }

        Map<Long, Set<Long>> overlapUsersByGroup = new HashMap<>();
        for (GroupMember membership : groupMemberRepository.findByUserIdIn(similarUserIds)) {
            Group group = membership.getGroup();
            if (group == null || group.getGroupId() == null || joinedGroupIds.contains(group.getGroupId())) {
                continue;
            }

            GroupCandidateScore groupScore = groupScores.get(group.getGroupId());
            if (groupScore == null || membership.getUserId() == null) {
                continue;
            }

            overlapUsersByGroup
                .computeIfAbsent(group.getGroupId(), ignored -> new HashSet<>())
                .add(membership.getUserId());
        }

        overlapUsersByGroup.forEach((groupId, overlapUsers) -> {
            GroupCandidateScore score = groupScores.get(groupId);
            if (score == null || overlapUsers.isEmpty()) {
                return;
            }

            score.overlapMembers = overlapUsers.size();
            score.score += 2;
        });
    }

    private void applyTrendingScore(Map<Long, GroupCandidateScore> groupScores) {
        if (groupScores.isEmpty()) {
            return;
        }

        LocalDateTime since = LocalDateTime.now().minusDays(7);
        List<Long> groupIds = new ArrayList<>(groupScores.keySet());
        Map<Long, Integer> recentActivityByGroup = new HashMap<>();

        for (Post post : postRepository.findByGroupIdInAndCreatedAtAfter(groupIds, since)) {
            if (post.getGroupId() == null) {
                continue;
            }

            recentActivityByGroup.merge(post.getGroupId(), 1, Integer::sum);
        }

        for (Comment comment : commentRepository.findByPostGroupIdInAndCreatedAtAfter(groupIds, since)) {
            if (comment.getPost() == null || comment.getPost().getGroupId() == null) {
                continue;
            }

            recentActivityByGroup.merge(comment.getPost().getGroupId(), 1, Integer::sum);
        }

        for (PostLike like : postLikeRepository.findByPostGroupIdInAndCreatedAtAfter(groupIds, since)) {
            if (like.getPost() == null || like.getPost().getGroupId() == null) {
                continue;
            }

            recentActivityByGroup.merge(like.getPost().getGroupId(), 1, Integer::sum);
        }

        groupScores.forEach((groupId, score) -> score.recentActivity = recentActivityByGroup.getOrDefault(groupId, 0));

        List<Map.Entry<Long, Integer>> activeGroups = recentActivityByGroup.entrySet().stream()
            .filter(entry -> entry.getValue() > 0)
            .sorted(Map.Entry.<Long, Integer>comparingByValue().reversed())
            .toList();

        if (activeGroups.isEmpty()) {
            return;
        }

        int trendingLimit = Math.max(1, (int) Math.ceil(activeGroups.size() * 0.25));
        for (int index = 0; index < trendingLimit; index += 1) {
            Long groupId = activeGroups.get(index).getKey();
            GroupCandidateScore score = groupScores.get(groupId);
            if (score == null) {
                continue;
            }

            score.trending = true;
            score.score += 2;
        }
    }

    private void applyPopularityScore(Map<Long, GroupCandidateScore> groupScores) {
        if (groupScores.isEmpty()) {
            return;
        }

        List<Long> groupIds = new ArrayList<>(groupScores.keySet());
        Map<Long, Long> membersCountByGroup = new HashMap<>();

        for (GroupMember membership : groupMemberRepository.findByGroupGroupIdIn(groupIds)) {
            Group group = membership.getGroup();
            if (group == null || group.getGroupId() == null) {
                continue;
            }

            membersCountByGroup.merge(group.getGroupId(), 1L, Long::sum);
        }

        groupScores.forEach((groupId, score) -> score.membersCount = membersCountByGroup.getOrDefault(groupId, 0L));

        List<Map.Entry<Long, Long>> rankedByMembers = membersCountByGroup.entrySet().stream()
            .filter(entry -> entry.getValue() > 0)
            .sorted(Map.Entry.<Long, Long>comparingByValue().reversed())
            .toList();

        if (rankedByMembers.isEmpty()) {
            return;
        }

        int popularityLimit = Math.max(1, (int) Math.ceil(rankedByMembers.size() * 0.25));
        for (int index = 0; index < popularityLimit; index += 1) {
            Long groupId = rankedByMembers.get(index).getKey();
            GroupCandidateScore score = groupScores.get(groupId);
            if (score == null) {
                continue;
            }

            score.popular = true;
            score.score += 1;
        }
    }

    private SuggestedUserDTO toSuggestedUser(UserCandidateScore score) {
        String displayName = userService.getDisplayName(score.userId);
        return new SuggestedUserDTO(
            score.userId,
            displayName,
            score.score,
            score.sharedGroups,
            score.sharedHashtags,
            score.sharedInteractions,
            score.sameDomain
        );
    }

    private SuggestedGroupDTO toSuggestedGroup(GroupCandidateScore score) {
        return new SuggestedGroupDTO(
            score.groupId,
            score.name,
            score.description,
            score.score,
            score.matchedHashtags,
            score.overlapMembers,
            score.recentActivity,
            score.membersCount,
            score.trending,
            score.popular
        );
    }

    private String resolveEmailDomain(Long userId) {
        try {
            UserFeignClient.UserResponse user = userService.getUserById(userId);
            if (user == null) {
                return null;
            }

            return extractEmailDomain(user.getEmail());
        } catch (Exception ignored) {
            return null;
        }
    }

    private String extractEmailDomain(String email) {
        if (email == null) {
            return null;
        }

        String normalized = email.trim().toLowerCase(Locale.ROOT);
        int atIndex = normalized.lastIndexOf('@');
        if (atIndex < 0 || atIndex == normalized.length() - 1) {
            return null;
        }

        return normalized.substring(atIndex + 1);
    }

    private Set<String> extractHashtagsFromPosts(List<Post> posts) {
        Set<String> hashtags = new HashSet<>();
        for (Post post : posts) {
            hashtags.addAll(extractHashtags(post.getContent()));
        }

        return hashtags;
    }

    private Set<String> extractHashtags(String value) {
        if (value == null || value.isBlank()) {
            return Set.of();
        }

        Set<String> hashtags = new HashSet<>();
        Matcher matcher = HASHTAG_PATTERN.matcher(value.toLowerCase(Locale.ROOT));
        while (matcher.find()) {
            hashtags.add(matcher.group());
        }

        return hashtags;
    }

    private static class UserCandidateScore {
        private final Long userId;
        private int score;
        private int sharedGroups;
        private int sharedHashtags;
        private int sharedInteractions;
        private boolean sameDomain;

        private UserCandidateScore(Long userId) {
            this.userId = userId;
        }

        private int signalsCount() {
            int count = 0;
            if (sharedGroups > 0) {
                count += 1;
            }
            if (sharedHashtags > 0) {
                count += 1;
            }
            if (sharedInteractions > 0) {
                count += 1;
            }
            if (sameDomain) {
                count += 1;
            }

            return count;
        }
    }

    private static class GroupCandidateScore {
        private final Long groupId;
        private final String name;
        private final String description;
        private int score;
        private int matchedHashtags;
        private int overlapMembers;
        private int recentActivity;
        private long membersCount;
        private boolean trending;
        private boolean popular;

        private GroupCandidateScore(Group group) {
            this.groupId = group.getGroupId();
            this.name = group.getName();
            this.description = group.getDescription();
        }
    }
}
