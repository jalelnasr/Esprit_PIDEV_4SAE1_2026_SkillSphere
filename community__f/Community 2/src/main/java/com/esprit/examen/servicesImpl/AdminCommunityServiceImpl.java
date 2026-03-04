package com.esprit.examen.servicesImpl;

import com.esprit.examen.dto.AdminActivityItemDTO;
import com.esprit.examen.dto.AdminCommunityStatsDTO;
import com.esprit.examen.dto.AdminMetricValueDTO;
import com.esprit.examen.dto.AdminPostCommentDTO;
import com.esprit.examen.dto.AdminPostDetailDTO;
import com.esprit.examen.dto.AdminPostLikeDTO;
import com.esprit.examen.dto.AdminPostListResponseDTO;
import com.esprit.examen.dto.AdminPostSummaryDTO;
import com.esprit.examen.entities.Answer;
import com.esprit.examen.entities.AnswerVote;
import com.esprit.examen.entities.Comment;
import com.esprit.examen.entities.CommentLike;
import com.esprit.examen.entities.Follow;
import com.esprit.examen.entities.Group;
import com.esprit.examen.entities.GroupMember;
import com.esprit.examen.entities.Message;
import com.esprit.examen.entities.Post;
import com.esprit.examen.entities.PostLike;
import com.esprit.examen.entities.Question;
import com.esprit.examen.repositories.AnswerRepository;
import com.esprit.examen.repositories.AnswerVoteRepository;
import com.esprit.examen.repositories.CommentLikeRepository;
import com.esprit.examen.repositories.CommentRepository;
import com.esprit.examen.repositories.FollowRepository;
import com.esprit.examen.repositories.GroupMemberRepository;
import com.esprit.examen.repositories.GroupRepository;
import com.esprit.examen.repositories.MessageRepository;
import com.esprit.examen.repositories.PostLikeRepository;
import com.esprit.examen.repositories.PostRepository;
import com.esprit.examen.repositories.QuestionRepository;
import com.esprit.examen.services.AdminCommunityService;
import jakarta.annotation.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AdminCommunityServiceImpl implements AdminCommunityService {

    private static final int WINDOW_DAYS = 30;
    private static final int MAX_PAGE_SIZE = 100;

    @Resource
    private PostRepository postRepository;

    @Resource
    private CommentRepository commentRepository;

    @Resource
    private PostLikeRepository postLikeRepository;

    @Resource
    private CommentLikeRepository commentLikeRepository;

    @Resource
    private QuestionRepository questionRepository;

    @Resource
    private AnswerRepository answerRepository;

    @Resource
    private AnswerVoteRepository answerVoteRepository;

    @Resource
    private GroupRepository groupRepository;

    @Resource
    private GroupMemberRepository groupMemberRepository;

    @Resource
    private MessageRepository messageRepository;

    @Resource
    private FollowRepository followRepository;

    @Override
    public AdminCommunityStatsDTO getStats() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime currentStart = now.minusDays(WINDOW_DAYS);
        LocalDateTime previousStart = now.minusDays(WINDOW_DAYS * 2L);

        long postsCurrent = postRepository.countByCreatedAtBetween(currentStart, now);
        long postsPrevious = postRepository.countByCreatedAtBetween(previousStart, currentStart);

        long questionsCurrent = questionRepository.countByCreatedAtBetween(currentStart, now);
        long questionsPrevious = questionRepository.countByCreatedAtBetween(previousStart, currentStart);

        long groupsCurrent = groupRepository.countByCreatedAtBetween(currentStart, now);
        long groupsPrevious = groupRepository.countByCreatedAtBetween(previousStart, currentStart);

        long activeUsersCurrent = collectActiveUsers(currentStart, now).size();
        long activeUsersPrevious = collectActiveUsers(previousStart, currentStart).size();

        return new AdminCommunityStatsDTO(
            WINDOW_DAYS,
            now,
            toMetric(postsCurrent, postsPrevious),
            toMetric(questionsCurrent, questionsPrevious),
            toMetric(groupsCurrent, groupsPrevious),
            toMetric(activeUsersCurrent, activeUsersPrevious)
        );
    }

    @Override
    public List<AdminActivityItemDTO> getRecentActivities(int limit) {
        int safeLimit = Math.max(1, Math.min(limit, MAX_PAGE_SIZE));
        Pageable pageable = PageRequest.of(0, safeLimit);
        LocalDateTime from = LocalDateTime.now().minusDays(WINDOW_DAYS);

        List<AdminActivityItemDTO> activities = new ArrayList<>();

        activities.addAll(postRepository.findByCreatedAtAfterOrderByCreatedAtDesc(from, pageable)
            .stream().map(this::toPostActivity).toList());
        activities.addAll(commentRepository.findByCreatedAtAfterOrderByCreatedAtDesc(from, pageable)
            .stream().map(this::toCommentActivity).toList());
        activities.addAll(questionRepository.findByCreatedAtAfterOrderByCreatedAtDesc(from, pageable)
            .stream().map(this::toQuestionActivity).toList());
        activities.addAll(answerRepository.findByCreatedAtAfterOrderByCreatedAtDesc(from, pageable)
            .stream().map(this::toAnswerActivity).toList());
        activities.addAll(groupRepository.findByCreatedAtAfterOrderByCreatedAtDesc(from, pageable)
            .stream().map(this::toGroupActivity).toList());
        activities.addAll(postLikeRepository.findByCreatedAtAfterOrderByCreatedAtDesc(from, pageable)
            .stream().map(this::toPostLikeActivity).toList());
        activities.addAll(commentLikeRepository.findByCreatedAtAfterOrderByCreatedAtDesc(from, pageable)
            .stream().map(this::toCommentLikeActivity).toList());
        activities.addAll(answerVoteRepository.findByCreatedAtAfterOrderByCreatedAtDesc(from, pageable)
            .stream().map(this::toAnswerVoteActivity).toList());
        activities.addAll(groupMemberRepository.findByJoinedAtAfterOrderByJoinedAtDesc(from, pageable)
            .stream().map(this::toGroupJoinActivity).toList());
        activities.addAll(messageRepository.findByCreatedAtAfterOrderByCreatedAtDesc(from, pageable)
            .stream().map(this::toMessageActivity).toList());
        activities.addAll(followRepository.findByCreatedAtAfterOrderByCreatedAtDesc(from, pageable)
            .stream().map(this::toFollowActivity).toList());

        return activities.stream()
            .sorted(Comparator.comparing(AdminActivityItemDTO::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
            .limit(safeLimit)
            .collect(Collectors.toList());
    }

    @Override
    public AdminPostListResponseDTO getPosts(int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.max(1, Math.min(size, MAX_PAGE_SIZE));
        Pageable pageable = PageRequest.of(safePage, safeSize);

        Page<Post> postPage = postRepository.findAllByOrderByCreatedAtDesc(pageable);
        List<AdminPostSummaryDTO> posts = postPage.getContent().stream()
            .map(this::toPostSummary)
            .toList();

        return new AdminPostListResponseDTO(posts, postPage.getTotalElements(), safePage, safeSize);
    }

    @Override
    public AdminPostDetailDTO getPostDetail(Long postId) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found with ID: " + postId));

        AdminPostSummaryDTO summary = toPostSummary(post);

        List<AdminPostLikeDTO> likes = postLikeRepository.findByPostPostId(postId).stream()
            .sorted(Comparator.comparing(PostLike::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
            .map(like -> new AdminPostLikeDTO(like.getPostLikeId(), like.getUserId(), like.getCreatedAt()))
            .toList();

        List<AdminPostCommentDTO> comments = commentRepository.findByPostPostIdOrderByCreatedAtDesc(postId).stream()
            .map(comment -> new AdminPostCommentDTO(
                comment.getCommentId(),
                comment.getContent(),
                comment.getUserId(),
                comment.getCreatedAt(),
                commentLikeRepository.countByCommentCommentId(comment.getCommentId())
            ))
            .toList();

        return new AdminPostDetailDTO(summary, likes, comments);
    }

    private AdminPostSummaryDTO toPostSummary(Post post) {
        long likesCount = postLikeRepository.countByPostPostId(post.getPostId());
        long commentsCount = commentRepository.countByPostPostId(post.getPostId());

        return new AdminPostSummaryDTO(
            post.getPostId(),
            post.getContent(),
            post.getImageUrl(),
            post.getVideoUrl(),
            post.getUserId(),
            post.getGroupId(),
            post.getCreatedAt(),
            likesCount,
            commentsCount
        );
    }

    private AdminMetricValueDTO toMetric(long current, long previous) {
        double growth;
        if (previous == 0L) {
            growth = current == 0L ? 0D : 100D;
        } else {
            growth = ((double) (current - previous) / previous) * 100D;
        }

        return new AdminMetricValueDTO(current, previous, Math.round(growth * 100.0) / 100.0);
    }

    private Set<Long> collectActiveUsers(LocalDateTime start, LocalDateTime end) {
        Set<Long> userIds = new HashSet<>();

        userIds.addAll(postRepository.findDistinctUserIdsByCreatedAtBetween(start, end));
        userIds.addAll(commentRepository.findDistinctUserIdsByCreatedAtBetween(start, end));
        userIds.addAll(questionRepository.findDistinctUserIdsByCreatedAtBetween(start, end));
        userIds.addAll(answerRepository.findDistinctUserIdsByCreatedAtBetween(start, end));
        userIds.addAll(postLikeRepository.findDistinctUserIdsByCreatedAtBetween(start, end));
        userIds.addAll(commentLikeRepository.findDistinctUserIdsByCreatedAtBetween(start, end));
        userIds.addAll(answerVoteRepository.findDistinctUserIdsByCreatedAtBetween(start, end));
        userIds.addAll(groupRepository.findDistinctCreatorIdsByCreatedAtBetween(start, end));
        userIds.addAll(groupMemberRepository.findDistinctUserIdsByJoinedAtBetween(start, end));
        userIds.addAll(messageRepository.findDistinctSenderIdsByCreatedAtBetween(start, end));
        userIds.addAll(messageRepository.findDistinctReceiverIdsByCreatedAtBetween(start, end));
        userIds.addAll(followRepository.findDistinctFollowerIdsByCreatedAtBetween(start, end));
        userIds.addAll(followRepository.findDistinctFollowingIdsByCreatedAtBetween(start, end));

        userIds.remove(null);
        return userIds;
    }

    private AdminActivityItemDTO toPostActivity(Post post) {
        return new AdminActivityItemDTO(
            "POST_CREATED",
            "Post published",
            compactText(post.getContent()),
            post.getUserId(),
            post.getPostId(),
            post.getCreatedAt()
        );
    }

    private AdminActivityItemDTO toCommentActivity(Comment comment) {
        return new AdminActivityItemDTO(
            "COMMENT_CREATED",
            "Comment added",
            compactText(comment.getContent()),
            comment.getUserId(),
            comment.getCommentId(),
            comment.getCreatedAt()
        );
    }

    private AdminActivityItemDTO toQuestionActivity(Question question) {
        return new AdminActivityItemDTO(
            "QUESTION_CREATED",
            "Question created",
            compactText(question.getTitle()),
            question.getUserId(),
            question.getQuestionId(),
            question.getCreatedAt()
        );
    }

    private AdminActivityItemDTO toAnswerActivity(Answer answer) {
        return new AdminActivityItemDTO(
            "ANSWER_CREATED",
            "Answer posted",
            compactText(answer.getContent()),
            answer.getUserId(),
            answer.getAnswerId(),
            answer.getCreatedAt()
        );
    }

    private AdminActivityItemDTO toGroupActivity(Group group) {
        return new AdminActivityItemDTO(
            "GROUP_CREATED",
            "Group created",
            compactText(group.getName()),
            group.getCreatedBy(),
            group.getGroupId(),
            group.getCreatedAt()
        );
    }

    private AdminActivityItemDTO toPostLikeActivity(PostLike like) {
        return new AdminActivityItemDTO(
            "POST_LIKED",
            "Post liked",
            "User liked post #" + (like.getPost() != null ? like.getPost().getPostId() : "N/A"),
            like.getUserId(),
            like.getPostLikeId(),
            like.getCreatedAt()
        );
    }

    private AdminActivityItemDTO toCommentLikeActivity(CommentLike like) {
        return new AdminActivityItemDTO(
            "COMMENT_LIKED",
            "Comment liked",
            "User liked comment #" + (like.getComment() != null ? like.getComment().getCommentId() : "N/A"),
            like.getUserId(),
            like.getCommentLikeId(),
            like.getCreatedAt()
        );
    }

    private AdminActivityItemDTO toAnswerVoteActivity(AnswerVote vote) {
        return new AdminActivityItemDTO(
            "ANSWER_VOTED",
            "Answer voted",
            "Vote type: " + vote.getVoteType(),
            vote.getUserId(),
            vote.getAnswerVoteId(),
            vote.getCreatedAt()
        );
    }

    private AdminActivityItemDTO toGroupJoinActivity(GroupMember member) {
        return new AdminActivityItemDTO(
            "GROUP_JOINED",
            "Group membership",
            "User joined group #" + (member.getGroup() != null ? member.getGroup().getGroupId() : "N/A"),
            member.getUserId(),
            member.getGroupMemberId(),
            member.getJoinedAt()
        );
    }

    private AdminActivityItemDTO toMessageActivity(Message message) {
        return new AdminActivityItemDTO(
            "MESSAGE_SENT",
            "Message sent",
            "To user #" + message.getReceiverId(),
            message.getSenderId(),
            message.getMessageId(),
            message.getCreatedAt()
        );
    }

    private AdminActivityItemDTO toFollowActivity(Follow follow) {
        return new AdminActivityItemDTO(
            "FOLLOW_CREATED",
            "Follow created",
            "User #" + follow.getFollowerId() + " followed user #" + follow.getFollowingId(),
            follow.getFollowerId(),
            follow.getFollowId(),
            follow.getCreatedAt()
        );
    }

    private String compactText(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }

        String normalized = value.replaceAll("\\s+", " ").trim();
        if (normalized.length() <= 90) {
            return normalized;
        }

        return normalized.substring(0, 87) + "...";
    }
}
