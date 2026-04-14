package com.esprit.examen.servicesImpl;

import com.esprit.examen.entities.Comment;
import com.esprit.examen.entities.CommentLike;
import com.esprit.examen.repositories.CommentLikeRepository;
import com.esprit.examen.repositories.CommentRepository;
import com.esprit.examen.services.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CommentLikeServiceImplTest {

    @Mock
    private CommentLikeRepository commentLikeRepository;

    @Mock
    private UserService userService;

    @Mock
    private CommentRepository commentRepository;

    @InjectMocks
    private CommentLikeServiceImpl commentLikeService;

    @Test
    void likeComment_throwsWhenUserMissing() {
        when(userService.userExists(1L)).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> commentLikeService.likeComment(1L, 2L));

        assertEquals("User not found with ID: 1", ex.getMessage());
    }

    @Test
    void likeComment_returnsExistingLikeIfAlreadyPresent() {
        CommentLike existing = new CommentLike();
        existing.setCommentLikeId(6L);

        when(userService.userExists(1L)).thenReturn(true);
        when(commentLikeRepository.findByUserIdAndCommentCommentId(1L, 2L)).thenReturn(existing);

        CommentLike result = commentLikeService.likeComment(1L, 2L);

        assertEquals(6L, result.getCommentLikeId());
        verify(commentRepository, never()).findById(any(Long.class));
    }

    @Test
    void likeComment_throwsWhenCommentMissing() {
        when(userService.userExists(1L)).thenReturn(true);
        when(commentLikeRepository.findByUserIdAndCommentCommentId(1L, 2L)).thenReturn(null);
        when(commentRepository.findById(2L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> commentLikeService.likeComment(1L, 2L));

        assertEquals("Comment not found with ID: 2", ex.getMessage());
    }

    @Test
    void likeComment_persistsNewLike() {
        Comment comment = new Comment();
        comment.setCommentId(2L);

        when(userService.userExists(1L)).thenReturn(true);
        when(commentLikeRepository.findByUserIdAndCommentCommentId(1L, 2L)).thenReturn(null);
        when(commentRepository.findById(2L)).thenReturn(Optional.of(comment));
        when(commentLikeRepository.save(any(CommentLike.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CommentLike saved = commentLikeService.likeComment(1L, 2L);

        assertEquals(1L, saved.getUserId());
        assertNotNull(saved.getCreatedAt());
        assertNotNull(saved.getComment());
    }

    @Test
    void unlikeComment_deletesExistingLike() {
        CommentLike existing = new CommentLike();
        when(commentLikeRepository.findByUserIdAndCommentCommentId(1L, 2L)).thenReturn(existing);

        commentLikeService.unlikeComment(1L, 2L);

        verify(commentLikeRepository).delete(existing);
    }

    @Test
    void unlikeComment_noopWhenMissing() {
        when(commentLikeRepository.findByUserIdAndCommentCommentId(1L, 2L)).thenReturn(null);

        commentLikeService.unlikeComment(1L, 2L);

        verify(commentLikeRepository, never()).delete(any(CommentLike.class));
    }

    @Test
    void getLikesByComment_delegates() {
        when(commentLikeRepository.findByCommentCommentId(4L)).thenReturn(List.of(new CommentLike(), new CommentLike()));

        assertEquals(2, commentLikeService.getLikesByComment(4L).size());
    }
}
