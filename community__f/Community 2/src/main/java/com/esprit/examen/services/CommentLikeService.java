package com.esprit.examen.services;

import com.esprit.examen.entities.CommentLike;

import java.util.List;

public interface CommentLikeService {
    CommentLike likeComment(Long userId, Long commentId);
    void unlikeComment(Long userId, Long commentId);
    List<CommentLike> getLikesByComment(Long commentId);
}
