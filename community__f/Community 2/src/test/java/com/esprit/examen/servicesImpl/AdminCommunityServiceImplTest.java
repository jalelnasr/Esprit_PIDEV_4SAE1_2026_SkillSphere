package com.esprit.examen.servicesImpl;

import com.esprit.examen.dto.AdminActivityItemDTO;
import com.esprit.examen.dto.AdminCommunityStatsDTO;
import com.esprit.examen.dto.AdminPostDetailDTO;
import com.esprit.examen.dto.AdminPostListResponseDTO;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class AdminCommunityServiceImplTest {

    @Mock
    private PostRepository postRepository;

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private PostLikeRepository postLikeRepository;

    @Mock
    private CommentLikeRepository commentLikeRepository;

    @Mock
    private QuestionRepository questionRepository;

    @Mock
    private AnswerRepository answerRepository;

    @Mock
    private AnswerVoteRepository answerVoteRepository;

    @Mock
    private GroupRepository groupRepository;

    @Mock
    private GroupMemberRepository groupMemberRepository;

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private FollowRepository followRepository;

    @InjectMocks
    private AdminCommunityServiceImpl adminCommunityService;

    @BeforeEach
    void setDefaultRepositoryResponses() {
        when(postRepository.findDistinctUserIdsByCreatedAtBetween(any(LocalDateTime.class), any(LocalDateTime.class))).thenReturn(List.of());
        when(commentRepository.findDistinctUserIdsByCreatedAtBetween(any(LocalDateTime.class), any(LocalDateTime.class))).thenReturn(List.of());
        when(questionRepository.findDistinctUserIdsByCreatedAtBetween(any(LocalDateTime.class), any(LocalDateTime.class))).thenReturn(List.of());
        when(answerRepository.findDistinctUserIdsByCreatedAtBetween(any(LocalDateTime.class), any(LocalDateTime.class))).thenReturn(List.of());
        when(postLikeRepository.findDistinctUserIdsByCreatedAtBetween(any(LocalDateTime.class), any(LocalDateTime.class))).thenReturn(List.of());
        when(commentLikeRepository.findDistinctUserIdsByCreatedAtBetween(any(LocalDateTime.class), any(LocalDateTime.class))).thenReturn(List.of());
        when(answerVoteRepository.findDistinctUserIdsByCreatedAtBetween(any(LocalDateTime.class), any(LocalDateTime.class))).thenReturn(List.of());
        when(groupRepository.findDistinctCreatorIdsByCreatedAtBetween(any(LocalDateTime.class), any(LocalDateTime.class))).thenReturn(List.of());
        when(groupMemberRepository.findDistinctUserIdsByJoinedAtBetween(any(LocalDateTime.class), any(LocalDateTime.class))).thenReturn(List.of());
        when(messageRepository.findDistinctSenderIdsByCreatedAtBetween(any(LocalDateTime.class), any(LocalDateTime.class))).thenReturn(List.of());
        when(messageRepository.findDistinctReceiverIdsByCreatedAtBetween(any(LocalDateTime.class), any(LocalDateTime.class))).thenReturn(List.of());
        when(followRepository.findDistinctFollowerIdsByCreatedAtBetween(any(LocalDateTime.class), any(LocalDateTime.class))).thenReturn(List.of());
        when(followRepository.findDistinctFollowingIdsByCreatedAtBetween(any(LocalDateTime.class), any(LocalDateTime.class))).thenReturn(List.of());

        when(postRepository.findByCreatedAtAfterOrderByCreatedAtDesc(any(LocalDateTime.class), any(Pageable.class))).thenReturn(List.of());
        when(commentRepository.findByCreatedAtAfterOrderByCreatedAtDesc(any(LocalDateTime.class), any(Pageable.class))).thenReturn(List.of());
        when(questionRepository.findByCreatedAtAfterOrderByCreatedAtDesc(any(LocalDateTime.class), any(Pageable.class))).thenReturn(List.of());
        when(answerRepository.findByCreatedAtAfterOrderByCreatedAtDesc(any(LocalDateTime.class), any(Pageable.class))).thenReturn(List.of());
        when(groupRepository.findByCreatedAtAfterOrderByCreatedAtDesc(any(LocalDateTime.class), any(Pageable.class))).thenReturn(List.of());
        when(postLikeRepository.findByCreatedAtAfterOrderByCreatedAtDesc(any(LocalDateTime.class), any(Pageable.class))).thenReturn(List.of());
        when(commentLikeRepository.findByCreatedAtAfterOrderByCreatedAtDesc(any(LocalDateTime.class), any(Pageable.class))).thenReturn(List.of());
        when(answerVoteRepository.findByCreatedAtAfterOrderByCreatedAtDesc(any(LocalDateTime.class), any(Pageable.class))).thenReturn(List.of());
        when(groupMemberRepository.findByJoinedAtAfterOrderByJoinedAtDesc(any(LocalDateTime.class), any(Pageable.class))).thenReturn(List.of());
        when(messageRepository.findByCreatedAtAfterOrderByCreatedAtDesc(any(LocalDateTime.class), any(Pageable.class))).thenReturn(List.of());
        when(followRepository.findByCreatedAtAfterOrderByCreatedAtDesc(any(LocalDateTime.class), any(Pageable.class))).thenReturn(List.of());
    }

    @Test
    void getStats_returnsComputedMetrics() {
        when(postRepository.countByCreatedAtBetween(any(LocalDateTime.class), any(LocalDateTime.class))).thenReturn(10L, 5L);
        when(questionRepository.countByCreatedAtBetween(any(LocalDateTime.class), any(LocalDateTime.class))).thenReturn(8L, 4L);
        when(groupRepository.countByCreatedAtBetween(any(LocalDateTime.class), any(LocalDateTime.class))).thenReturn(6L, 3L);

        when(postRepository.findDistinctUserIdsByCreatedAtBetween(any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(List.of(1L, 2L), List.of(1L));

        AdminCommunityStatsDTO stats = adminCommunityService.getStats();

        assertNotNull(stats);
        assertEquals(30, stats.getWindowDays());
        assertEquals(10L, stats.getPosts().getCurrent());
        assertEquals(5L, stats.getPosts().getPrevious());
        assertEquals(2L, stats.getActiveUsers().getCurrent());
    }

    @Test
    void getRecentActivities_mergesAndSortsAcrossSources() {
        Post post = new Post();
        post.setPostId(1L);
        post.setUserId(10L);
        post.setContent("post");
        post.setCreatedAt(LocalDateTime.now().minusMinutes(1));

        Follow follow = new Follow();
        follow.setFollowId(2L);
        follow.setFollowerId(11L);
        follow.setFollowingId(12L);
        follow.setCreatedAt(LocalDateTime.now().minusMinutes(2));

        when(postRepository.findByCreatedAtAfterOrderByCreatedAtDesc(any(LocalDateTime.class), any(Pageable.class))).thenReturn(List.of(post));
        when(followRepository.findByCreatedAtAfterOrderByCreatedAtDesc(any(LocalDateTime.class), any(Pageable.class))).thenReturn(List.of(follow));

        List<AdminActivityItemDTO> activities = adminCommunityService.getRecentActivities(5);

        assertEquals(2, activities.size());
        assertEquals("POST_CREATED", activities.get(0).getType());
        assertEquals("FOLLOW_CREATED", activities.get(1).getType());
    }

    @Test
    void getPosts_returnsPaginatedSummaries() {
        Post post = new Post();
        post.setPostId(6L);
        post.setUserId(4L);
        post.setContent("hello");

        when(postRepository.findAllByOrderByCreatedAtDesc(any(Pageable.class)))
            .thenReturn(new PageImpl<>(List.of(post), PageRequest.of(0, 20), 1));
        when(postLikeRepository.countByPostPostId(6L)).thenReturn(3L);
        when(commentRepository.countByPostPostId(6L)).thenReturn(2L);

        AdminPostListResponseDTO response = adminCommunityService.getPosts(0, 20);

        assertEquals(1L, response.getTotal());
        assertEquals(1, response.getPosts().size());
        assertEquals(6L, response.getPosts().get(0).getPostId());
        assertEquals(3L, response.getPosts().get(0).getLikesCount());
    }

    @Test
    void getPostDetail_throwsWhenPostMissing() {
        when(postRepository.findById(404L)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> adminCommunityService.getPostDetail(404L));
    }

    @Test
    void getPostDetail_returnsSummaryLikesAndComments() {
        Post post = new Post();
        post.setPostId(9L);
        post.setUserId(1L);
        post.setContent("post body");

        PostLike like = new PostLike();
        like.setPostLikeId(1L);
        like.setUserId(2L);
        like.setCreatedAt(LocalDateTime.now());
        like.setPost(post);

        Comment comment = new Comment();
        comment.setCommentId(11L);
        comment.setUserId(3L);
        comment.setContent("nice");
        comment.setCreatedAt(LocalDateTime.now());
        comment.setPost(post);

        when(postRepository.findById(9L)).thenReturn(Optional.of(post));
        when(postLikeRepository.countByPostPostId(9L)).thenReturn(1L);
        when(commentRepository.countByPostPostId(9L)).thenReturn(1L);
        when(postLikeRepository.findByPostPostId(9L)).thenReturn(List.of(like));
        when(commentRepository.findByPostPostIdOrderByCreatedAtDesc(9L)).thenReturn(List.of(comment));
        when(commentLikeRepository.countByCommentCommentId(11L)).thenReturn(4L);

        AdminPostDetailDTO detail = adminCommunityService.getPostDetail(9L);

        assertEquals(9L, detail.getPost().getPostId());
        assertEquals(1, detail.getLikes().size());
        assertEquals(1, detail.getComments().size());
        assertEquals(4L, detail.getComments().get(0).getLikesCount());
    }
}
