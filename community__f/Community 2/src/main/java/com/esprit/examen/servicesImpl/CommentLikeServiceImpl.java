package com.esprit.examen.servicesImpl;

import com.esprit.examen.entities.Comment;
import com.esprit.examen.entities.CommentLike;
import com.esprit.examen.services.UserService;
import com.esprit.examen.repositories.CommentLikeRepository;
import com.esprit.examen.repositories.CommentRepository;
import com.esprit.examen.services.CommentLikeService;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CommentLikeServiceImpl implements CommentLikeService {

    @Resource
    private CommentLikeRepository commentLikeRepository;

    @Resource
    private UserService userService;

    @Resource
    private CommentRepository commentRepository;

    @Override
    public CommentLike likeComment(Long userId, Long commentId) {
        if (!userService.userExists(userId)) {
            throw new RuntimeException("User not found with ID: " + userId);
        }

        CommentLike existingLike = commentLikeRepository.findByUserIdAndCommentCommentId(userId, commentId);
        if (existingLike != null) {
            return existingLike;
        }

        Comment comment = commentRepository.findById(commentId).orElse(null);
        if (comment == null) {
            throw new RuntimeException("Comment not found with ID: " + commentId);
        }

        CommentLike commentLike = new CommentLike();
        commentLike.setUserId(userId);
        commentLike.setComment(comment);
        commentLike.setCreatedAt(LocalDateTime.now());
        // Don't set commentLikeId - let database auto-generate it
        return commentLikeRepository.save(commentLike);
    }

    @Override
    public void unlikeComment(Long userId, Long commentId) {
        CommentLike commentLike = commentLikeRepository.findByUserIdAndCommentCommentId(userId, commentId);
        if (commentLike != null) {
            commentLikeRepository.delete(commentLike);
        }
    }

    @Override
    public List<CommentLike> getLikesByComment(Long commentId) {
        return commentLikeRepository.findByCommentCommentId(commentId);
    }
}
