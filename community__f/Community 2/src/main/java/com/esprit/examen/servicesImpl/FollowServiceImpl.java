package com.esprit.examen.servicesImpl;

import com.esprit.examen.entities.Follow;
import com.esprit.examen.services.UserService;
import com.esprit.examen.repositories.FollowRepository;
import com.esprit.examen.services.FollowService;
import jakarta.annotation.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FollowServiceImpl implements FollowService {

    @Resource
    private FollowRepository followRepository;

    @Resource
    private UserService userService;

    @Override
    public Follow followUser(Long followerId, Long followingId) {
        if (followerId.equals(followingId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot follow yourself");
        }

        if (!userService.userExists(followerId) || !userService.userExists(followingId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }

        if (followRepository.existsByFollowerIdAndFollowingId(followerId, followingId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Already following");
        }

        Follow follow = new Follow();
        follow.setFollowerId(followerId);
        follow.setFollowingId(followingId);
        follow.setCreatedAt(LocalDateTime.now());
        // Don't set followId - let database auto-generate it
        return followRepository.save(follow);
    }

    @Override
    public void unfollowUser(Long followerId, Long followingId) {
        Follow follow = followRepository.findByFollowerIdAndFollowingId(followerId, followingId);
        if (follow != null) {
            followRepository.delete(follow);
        }
    }

    @Override
    public boolean isFollowing(Long followerId, Long followingId) {
        return followRepository.existsByFollowerIdAndFollowingId(followerId, followingId);
    }

    @Override
    public List<Follow> getFollowers(Long userId) {
        return followRepository.findByFollowingId(userId);
    }

    @Override
    public List<Follow> getFollowing(Long userId) {
        return followRepository.findByFollowerId(userId);
    }

    @Override
    public long countFollowers(Long userId) {
        return followRepository.findByFollowingId(userId).size();
    }

    @Override
    public long countFollowing(Long userId) {
        return followRepository.findByFollowerId(userId).size();
    }
}
