package com.esprit.examen.servicesImpl;

import com.esprit.examen.dto.NotificationEventDTO;
import com.esprit.examen.entities.Post;
import com.esprit.examen.entities.PostLike;
import com.esprit.examen.repositories.PostLikeRepository;
import com.esprit.examen.repositories.PostRepository;
import com.esprit.examen.services.NotificationSseService;
import com.esprit.examen.services.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PostLikeServiceImplTest {

    @Mock
    private PostLikeRepository postLikeRepository;

    @Mock
    private UserService userService;

    @Mock
    private PostRepository postRepository;

    @Mock
    private NotificationSseService notificationSseService;

    @InjectMocks
    private PostLikeServiceImpl postLikeService;

    @Test
    void likePost_throwsWhenUserMissing() {
        when(userService.userExists(1L)).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> postLikeService.likePost(1L, 3L));

        assertEquals("User not found with ID: 1", ex.getMessage());
    }

    @Test
    void likePost_returnsExistingLikeWhenAlreadyLiked() {
        PostLike existing = new PostLike();
        existing.setPostLikeId(7L);

        when(userService.userExists(2L)).thenReturn(true);
        when(postLikeRepository.findByUserIdAndPostPostId(2L, 9L)).thenReturn(existing);

        PostLike result = postLikeService.likePost(2L, 9L);

        assertEquals(7L, result.getPostLikeId());
        verify(postRepository, never()).findById(any(Long.class));
    }

    @Test
    void likePost_throwsWhenPostMissing() {
        when(userService.userExists(2L)).thenReturn(true);
        when(postLikeRepository.findByUserIdAndPostPostId(2L, 9L)).thenReturn(null);
        when(postRepository.findById(9L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> postLikeService.likePost(2L, 9L));

        assertEquals("Post not found with ID: 9", ex.getMessage());
    }

    @Test
    void likePost_sendsNotificationToPostOwner() {
        Post post = new Post();
        post.setPostId(9L);
        post.setUserId(11L);

        when(userService.userExists(2L)).thenReturn(true);
        when(postLikeRepository.findByUserIdAndPostPostId(2L, 9L)).thenReturn(null);
        when(postRepository.findById(9L)).thenReturn(Optional.of(post));
        when(postLikeRepository.save(any(PostLike.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userService.getDisplayName(2L)).thenReturn("Alice Doe");

        PostLike saved = postLikeService.likePost(2L, 9L);

        assertEquals(2L, saved.getUserId());
        assertNotNull(saved.getCreatedAt());
        verify(notificationSseService).sendToUser(eq(11L), any(NotificationEventDTO.class));
    }

    @Test
    void likePost_skipsNotificationWhenOwnerLikesOwnPost() {
        Post post = new Post();
        post.setPostId(9L);
        post.setUserId(2L);

        when(userService.userExists(2L)).thenReturn(true);
        when(postLikeRepository.findByUserIdAndPostPostId(2L, 9L)).thenReturn(null);
        when(postRepository.findById(9L)).thenReturn(Optional.of(post));
        when(postLikeRepository.save(any(PostLike.class))).thenAnswer(invocation -> invocation.getArgument(0));

        postLikeService.likePost(2L, 9L);

        verify(notificationSseService, never()).sendToUser(any(Long.class), any(NotificationEventDTO.class));
    }

    @Test
    void unlikePost_deletesExistingLike() {
        PostLike existing = new PostLike();
        when(postLikeRepository.findByUserIdAndPostPostId(3L, 4L)).thenReturn(existing);

        postLikeService.unlikePost(3L, 4L);

        verify(postLikeRepository).delete(existing);
    }

    @Test
    void unlikePost_noopWhenLikeMissing() {
        when(postLikeRepository.findByUserIdAndPostPostId(3L, 4L)).thenReturn(null);

        postLikeService.unlikePost(3L, 4L);

        verify(postLikeRepository, never()).delete(any(PostLike.class));
    }

    @Test
    void getLikesByPost_andCountLikes_delegates() {
        when(postLikeRepository.findByPostPostId(14L)).thenReturn(List.of(new PostLike(), new PostLike()));

        assertEquals(2, postLikeService.getLikesByPost(14L).size());
        assertEquals(2, postLikeService.countLikesByPost(14L));
    }
}
