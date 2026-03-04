package com.esprit.examen.servicesImpl;

import com.esprit.examen.entities.Post;
import com.esprit.examen.services.UserService;
import com.esprit.examen.repositories.PostRepository;
import com.esprit.examen.services.PostService;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PostServiceImpl implements PostService {

    @Resource
    private PostRepository postRepository;

    @Resource
    private UserService userService;

    @Override
    public Post createPost(Post post, Long userId) {
        if (!userService.userExists(userId)) {
            throw new RuntimeException("User not found with ID: " + userId);
        }
        post.setUserId(userId);
        post.setCreatedAt(LocalDateTime.now());
        // Don't set postId - let database auto-generate it
        return postRepository.save(post);
    }

    @Override
    public Post getPostById(Long id) {
        return postRepository.findById(id).orElse(null);
    }

    @Override
    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    @Override
    public List<Post> getPostsByUser(Long userId) {
        return postRepository.findByUserId(userId);
    }

    @Override
    public List<Post> getPostsByGroup(Long groupId) {
        return postRepository.findByGroupId(groupId);
    }

    @Override
    public Post updatePost(Long id, Post post) {
        Post existing = postRepository.findById(id).orElse(null);
        if (existing != null) {
            existing.setContent(post.getContent());
            existing.setImageUrl(post.getImageUrl());
            existing.setVideoUrl(post.getVideoUrl());
            existing.setGroupId(post.getGroupId());
            return postRepository.save(existing);
        }
        return null;
    }

    @Override
    public void deletePost(Long id) {
        postRepository.deleteById(id);
    }
}
