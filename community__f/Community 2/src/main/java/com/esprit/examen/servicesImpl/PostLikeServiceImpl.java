package com.esprit.examen.servicesImpl;

import com.esprit.examen.entities.Post;
import com.esprit.examen.entities.PostLike;
import com.esprit.examen.services.UserService;
import com.esprit.examen.repositories.PostLikeRepository;
import com.esprit.examen.repositories.PostRepository;
import com.esprit.examen.services.PostLikeService;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PostLikeServiceImpl implements PostLikeService {

    @Resource
    private PostLikeRepository postLikeRepository;

    @Resource
    private UserService userService;

    @Resource
    private PostRepository postRepository;

    @Override
    public PostLike likePost(Long userId, Long postId) {
        if (!userService.userExists(userId)) {
            throw new RuntimeException("User not found with ID: " + userId);
        }

        PostLike existingLike = postLikeRepository.findByUserIdAndPostPostId(userId, postId);
        if (existingLike != null) {
            return existingLike;
        }

        Post post = postRepository.findById(postId).orElse(null);
        if (post == null) {
            throw new RuntimeException("Post not found with ID: " + postId);
        }

        PostLike postLike = new PostLike();
        postLike.setUserId(userId);
        postLike.setPost(post);
        postLike.setCreatedAt(LocalDateTime.now());
        // Don't set postLikeId - let database auto-generate it
        return postLikeRepository.save(postLike);
    }

    @Override
    public void unlikePost(Long userId, Long postId) {
        PostLike postLike = postLikeRepository.findByUserIdAndPostPostId(userId, postId);
        if (postLike != null) {
            postLikeRepository.delete(postLike);
        }
    }

    @Override
    public List<PostLike> getLikesByPost(Long postId) {
        return postLikeRepository.findByPostPostId(postId);
    }

    @Override
    public long countLikesByPost(Long postId) {
        return postLikeRepository.findByPostPostId(postId).size();
    }
}
