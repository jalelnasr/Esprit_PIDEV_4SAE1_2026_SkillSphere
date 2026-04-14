package com.esprit.examen.servicesImpl;

import com.esprit.examen.entities.Comment;
import com.esprit.examen.entities.Post;
import com.esprit.examen.repositories.CommentRepository;
import com.esprit.examen.repositories.PostRepository;
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
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CommentServiceImplTest {

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private UserService userService;

    @Mock
    private PostRepository postRepository;

    @InjectMocks
    private CommentServiceImpl commentService;

    @Test
    void createComment_setsFieldsAndPersists() {
        Comment comment = new Comment();
        comment.setContent("hello");

        Post post = new Post();
        post.setPostId(8L);

        when(userService.userExists(2L)).thenReturn(true);
        when(postRepository.findById(8L)).thenReturn(Optional.of(post));
        when(commentRepository.save(any(Comment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Comment created = commentService.createComment(comment, 2L, 8L);

        assertEquals(2L, created.getUserId());
        assertNotNull(created.getCreatedAt());
        assertNotNull(created.getPost());
        assertEquals(8L, created.getPost().getPostId());
    }

    @Test
    void createComment_throwsWhenUserMissing() {
        when(userService.userExists(100L)).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> commentService.createComment(new Comment(), 100L, 3L));

        assertEquals("User not found with ID: 100", ex.getMessage());
    }

    @Test
    void getCommentById_returnsEntityOrNull() {
        Comment comment = new Comment();
        comment.setCommentId(1L);

        when(commentRepository.findById(1L)).thenReturn(Optional.of(comment));
        when(commentRepository.findById(2L)).thenReturn(Optional.empty());

        assertEquals(1L, commentService.getCommentById(1L).getCommentId());
        assertNull(commentService.getCommentById(2L));
    }

    @Test
    void getCommentsByPost_delegates() {
        when(commentRepository.findByPostPostId(8L)).thenReturn(List.of(new Comment()));

        assertEquals(1, commentService.getCommentsByPost(8L).size());
    }

    @Test
    void getCommentsByUser_delegates() {
        when(commentRepository.findByUserId(8L)).thenReturn(List.of(new Comment(), new Comment()));

        assertEquals(2, commentService.getCommentsByUser(8L).size());
    }

    @Test
    void updateComment_updatesWhenExists() {
        Comment existing = new Comment();
        existing.setCommentId(3L);
        existing.setContent("old");

        Comment payload = new Comment();
        payload.setContent("new");

        when(commentRepository.findById(3L)).thenReturn(Optional.of(existing));
        when(commentRepository.save(any(Comment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Comment updated = commentService.updateComment(3L, payload);

        assertNotNull(updated);
        assertEquals("new", updated.getContent());
    }

    @Test
    void updateComment_returnsNullWhenNotFound() {
        when(commentRepository.findById(50L)).thenReturn(Optional.empty());

        assertNull(commentService.updateComment(50L, new Comment()));
    }

    @Test
    void deleteComment_delegates() {
        commentService.deleteComment(4L);

        verify(commentRepository).deleteById(4L);
    }
}
