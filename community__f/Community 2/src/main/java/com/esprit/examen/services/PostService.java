package com.esprit.examen.services;

import com.esprit.examen.entities.Post;

import java.util.List;

public interface PostService {
    Post createPost(Post post, Long userId);
    Post getPostById(Long id);
    List<Post> getAllPosts();
    List<Post> getPostsByUser(Long userId);
    List<Post> getPostsByGroup(Long groupId);
    Post updatePost(Long id, Post post);
    void deletePost(Long id);
}