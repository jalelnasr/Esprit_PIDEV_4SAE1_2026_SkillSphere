package com.esprit.examen.services;

import com.esprit.examen.entities.PostLike;

import java.util.List;

public interface PostLikeService {
    PostLike likePost(Long userId, Long postId);
    void unlikePost(Long userId, Long postId);
    List<PostLike> getLikesByPost(Long postId);
    long countLikesByPost(Long postId);
}
