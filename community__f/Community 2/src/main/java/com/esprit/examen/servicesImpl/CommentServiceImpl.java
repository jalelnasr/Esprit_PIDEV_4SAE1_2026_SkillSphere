package com.esprit.examen.servicesImpl;

import com.esprit.examen.entities.Comment;
import com.esprit.examen.entities.Post;
import com.esprit.examen.services.UserService;
import com.esprit.examen.repositories.CommentRepository;
import com.esprit.examen.repositories.PostRepository;
import com.esprit.examen.services.CommentService;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CommentServiceImpl implements CommentService {

    @Resource
    private CommentRepository commentRepository;

    @Resource
    private UserService userService;

    @Resource
    private PostRepository postRepository;

    @Override
    public Comment createComment(Comment comment, Long userId, Long postId) {
        if (!userService.userExists(userId)) {
            throw new RuntimeException("User not found with ID: " + userId);
        }
        Post post = postRepository.findById(postId).orElse(null);
        comment.setUserId(userId);
        comment.setPost(post);
        comment.setCreatedAt(LocalDateTime.now());
        // Don't set commentId - let database auto-generate it
        return commentRepository.save(comment);
    }

    @Override
    public Comment getCommentById(Long id) {
        return commentRepository.findById(id).orElse(null);
    }

    @Override
    public List<Comment> getCommentsByPost(Long postId) {
        return commentRepository.findByPostPostId(postId);
    }

    @Override
    public List<Comment> getCommentsByUser(Long userId) {
        return commentRepository.findByUserId(userId);
    }

    @Override
    public Comment updateComment(Long id, Comment comment) {
        Comment existing = commentRepository.findById(id).orElse(null);
        if (existing != null) {
            existing.setContent(comment.getContent());
            return commentRepository.save(existing);
        }
        return null;
    }

    @Override
    public void deleteComment(Long id) {
        commentRepository.deleteById(id);
    }
}