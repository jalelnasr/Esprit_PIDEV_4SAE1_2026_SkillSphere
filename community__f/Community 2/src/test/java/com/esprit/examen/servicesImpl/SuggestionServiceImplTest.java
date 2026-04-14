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
import com.esprit.examen.services.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SuggestionServiceImplTest {

    @Mock
    private FollowRepository followRepository;

    @Mock
    private GroupRepository groupRepository;

    @Mock
    private GroupMemberRepository groupMemberRepository;

    @Mock
    private PostRepository postRepository;

    @Mock
    private PostLikeRepository postLikeRepository;

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private SuggestionServiceImpl suggestionService;

    @Test
    void suggestUsersForCurrentUser_combinesSignalsIntoRankedSuggestions() {
        when(userService.getCurrentUserId()).thenReturn(1L);

        Follow alreadyFollowing = new Follow();
        alreadyFollowing.setFollowingId(2L);
        when(followRepository.findByFollowerId(1L)).thenReturn(List.of(alreadyFollowing));

        Group sharedGroup = new Group();
        sharedGroup.setGroupId(10L);

        GroupMember currentMembership = new GroupMember();
        currentMembership.setUserId(1L);
        currentMembership.setGroup(sharedGroup);

        GroupMember candidateMembership = new GroupMember();
        candidateMembership.setUserId(3L);
        candidateMembership.setGroup(sharedGroup);

        when(groupMemberRepository.findByUserId(1L)).thenReturn(List.of(currentMembership));
        when(groupMemberRepository.findByGroupGroupIdIn(anyCollection())).thenReturn(List.of(currentMembership, candidateMembership));

        Post myPost = new Post();
        myPost.setUserId(1L);
        myPost.setContent("Learning #java");
        when(postRepository.findByUserId(1L)).thenReturn(List.of(myPost));

        Post candidateHashTagPost = new Post();
        candidateHashTagPost.setUserId(3L);
        candidateHashTagPost.setContent("We love #java and #spring");
        when(postRepository.findByContentContainingAndUserIdNotIn(eq("#"), any(Collection.class)))
            .thenReturn(List.of(candidateHashTagPost));

        Post likedPost = new Post();
        likedPost.setPostId(100L);
        PostLike myLike = new PostLike();
        myLike.setPost(likedPost);
        when(postLikeRepository.findByUserId(1L)).thenReturn(List.of(myLike));

        when(commentRepository.findByUserId(1L)).thenReturn(List.of());

        PostLike candidateLike = new PostLike();
        candidateLike.setUserId(3L);
        candidateLike.setPost(likedPost);
        when(postLikeRepository.findByPostPostIdInAndUserIdNotIn(anyCollection(), anyCollection()))
            .thenReturn(List.of(candidateLike));
        when(commentRepository.findByPostPostIdInAndUserIdNotIn(anyCollection(), anyCollection()))
            .thenReturn(List.of());

        UserFeignClient.UserResponse currentUser = new UserFeignClient.UserResponse();
        currentUser.setIdUser(1L);
        currentUser.setEmail("current@esprit.tn");

        UserFeignClient.UserResponse candidateUser = new UserFeignClient.UserResponse();
        candidateUser.setIdUser(3L);
        candidateUser.setEmail("candidate@esprit.tn");

        when(userService.getUserById(1L)).thenReturn(currentUser);
        when(userService.getUserById(3L)).thenReturn(candidateUser);
        when(userService.getDisplayName(3L)).thenReturn("Candidate User");

        List<SuggestedUserDTO> suggestions = suggestionService.suggestUsersForCurrentUser();

        assertEquals(1, suggestions.size());
        assertEquals(3L, suggestions.get(0).getUserId());
        assertFalse(suggestions.get(0).getDisplayName().isBlank());
    }

    @Test
    void suggestGroupsForCurrentUser_scoresGroupByHashtagsOverlapAndTrendSignals() {
        when(userService.getCurrentUserId()).thenReturn(1L);

        Group joinedGroup = new Group();
        joinedGroup.setGroupId(10L);
        joinedGroup.setName("Joined");

        Group candidateGroup = new Group();
        candidateGroup.setGroupId(20L);
        candidateGroup.setName("#java community");
        candidateGroup.setDescription("All about #java");

        GroupMember joinedMembership = new GroupMember();
        joinedMembership.setUserId(1L);
        joinedMembership.setGroup(joinedGroup);

        GroupMember similarUserInJoinedGroup = new GroupMember();
        similarUserInJoinedGroup.setUserId(3L);
        similarUserInJoinedGroup.setGroup(joinedGroup);

        GroupMember similarUserInCandidateGroup = new GroupMember();
        similarUserInCandidateGroup.setUserId(3L);
        similarUserInCandidateGroup.setGroup(candidateGroup);

        GroupMember secondCandidateMember = new GroupMember();
        secondCandidateMember.setUserId(4L);
        secondCandidateMember.setGroup(candidateGroup);

        when(groupMemberRepository.findByUserId(1L)).thenReturn(List.of(joinedMembership));
        when(groupRepository.findAll()).thenReturn(List.of(joinedGroup, candidateGroup));

        when(groupMemberRepository.findByGroupGroupIdIn(anyCollection())).thenAnswer(invocation -> {
            Collection<Long> ids = invocation.getArgument(0);
            if (ids.contains(10L)) {
                return List.of(joinedMembership, similarUserInJoinedGroup);
            }
            if (ids.contains(20L)) {
                return List.of(similarUserInCandidateGroup, secondCandidateMember);
            }
            return List.of();
        });

        when(groupMemberRepository.findByUserIdIn(anyCollection())).thenReturn(List.of(similarUserInCandidateGroup));

        Post myPost = new Post();
        myPost.setUserId(1L);
        myPost.setContent("I enjoy #java");
        when(postRepository.findByUserId(1L)).thenReturn(List.of(myPost));

        Post groupPost = new Post();
        groupPost.setGroupId(20L);
        groupPost.setCreatedAt(LocalDateTime.now());
        when(postRepository.findByGroupIdInAndCreatedAtAfter(anyCollection(), any(LocalDateTime.class))).thenReturn(List.of(groupPost));

        Comment groupComment = new Comment();
        groupComment.setPost(groupPost);
        groupComment.setCreatedAt(LocalDateTime.now());
        when(commentRepository.findByPostGroupIdInAndCreatedAtAfter(anyCollection(), any(LocalDateTime.class))).thenReturn(List.of(groupComment));

        PostLike groupLike = new PostLike();
        groupLike.setPost(groupPost);
        groupLike.setCreatedAt(LocalDateTime.now());
        when(postLikeRepository.findByPostGroupIdInAndCreatedAtAfter(anyCollection(), any(LocalDateTime.class))).thenReturn(List.of(groupLike));

        List<SuggestedGroupDTO> suggestions = suggestionService.suggestGroupsForCurrentUser();

        assertEquals(1, suggestions.size());
        SuggestedGroupDTO suggested = suggestions.get(0);
        assertEquals(20L, suggested.getGroupId());
        assertEquals(true, suggested.isTrending());
        assertEquals(true, suggested.isPopular());
    }
}
