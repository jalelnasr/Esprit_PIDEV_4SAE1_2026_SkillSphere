package com.esprit.examen.services;

import com.esprit.examen.entities.Comment;

import java.util.List;

public interface CommentService {
    Comment createComment(Comment comment, Long userId, Long postId);
    Comment getCommentById(Long id);
    List<Comment> getCommentsByPost(Long postId);
    List<Comment> getCommentsByUser(Long userId);
    Comment updateComment(Long id, Comment comment);
    void deleteComment(Long id);
}
