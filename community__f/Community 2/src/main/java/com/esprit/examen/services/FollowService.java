package com.esprit.examen.services;

import com.esprit.examen.entities.Follow;

import java.util.List;

public interface FollowService {
    Follow followUser(Long followerId, Long followingId);
    void unfollowUser(Long followerId, Long followingId);
    boolean isFollowing(Long followerId, Long followingId);
    List<Follow> getFollowers(Long userId);
    List<Follow> getFollowing(Long userId);
    long countFollowers(Long userId);
    long countFollowing(Long userId);
}
