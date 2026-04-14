package com.esprit.examen.servicesImpl;

import com.esprit.examen.dto.NotificationEventDTO;
import com.esprit.examen.entities.Follow;
import com.esprit.examen.repositories.FollowRepository;
import com.esprit.examen.services.NotificationSseService;
import com.esprit.examen.services.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FollowServiceImplTest {

    @Mock
    private FollowRepository followRepository;

    @Mock
    private UserService userService;

    @Mock
    private NotificationSseService notificationSseService;

    @InjectMocks
    private FollowServiceImpl followService;

    @Test
    void followUser_throwsWhenFollowingSelf() {
        assertThrows(ResponseStatusException.class, () -> followService.followUser(1L, 1L));
    }

    @Test
    void followUser_throwsWhenUserMissing() {
        when(userService.userExists(1L)).thenReturn(true);
        when(userService.userExists(2L)).thenReturn(false);

        assertThrows(ResponseStatusException.class, () -> followService.followUser(1L, 2L));
    }

    @Test
    void followUser_throwsWhenAlreadyFollowing() {
        when(userService.userExists(1L)).thenReturn(true);
        when(userService.userExists(2L)).thenReturn(true);
        when(followRepository.existsByFollowerIdAndFollowingId(1L, 2L)).thenReturn(true);

        assertThrows(ResponseStatusException.class, () -> followService.followUser(1L, 2L));
    }

    @Test
    void followUser_persistsAndNotifiesFollowedUser() {
        when(userService.userExists(1L)).thenReturn(true);
        when(userService.userExists(2L)).thenReturn(true);
        when(followRepository.existsByFollowerIdAndFollowingId(1L, 2L)).thenReturn(false);
        when(userService.getDisplayName(1L)).thenReturn("Alice");
        when(followRepository.save(any(Follow.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Follow created = followService.followUser(1L, 2L);

        assertEquals(1L, created.getFollowerId());
        assertEquals(2L, created.getFollowingId());
        assertNotNull(created.getCreatedAt());
        verify(notificationSseService).sendToUser(eq(2L), any(NotificationEventDTO.class));
    }

    @Test
    void unfollowUser_deletesExistingRelation() {
        Follow follow = new Follow();
        when(followRepository.findByFollowerIdAndFollowingId(1L, 2L)).thenReturn(follow);

        followService.unfollowUser(1L, 2L);

        verify(followRepository).delete(follow);
    }

    @Test
    void unfollowUser_noopWhenRelationMissing() {
        when(followRepository.findByFollowerIdAndFollowingId(1L, 2L)).thenReturn(null);

        followService.unfollowUser(1L, 2L);

        verify(followRepository, never()).delete(any(Follow.class));
    }

    @Test
    void isFollowing_delegates() {
        when(followRepository.existsByFollowerIdAndFollowingId(1L, 2L)).thenReturn(true);

        assertEquals(true, followService.isFollowing(1L, 2L));
    }

    @Test
    void getFollowers_getFollowing_andCounts_delegate() {
        when(followRepository.findByFollowingId(7L)).thenReturn(List.of(new Follow(), new Follow()));
        when(followRepository.findByFollowerId(7L)).thenReturn(List.of(new Follow()));

        assertEquals(2, followService.getFollowers(7L).size());
        assertEquals(1, followService.getFollowing(7L).size());
        assertEquals(2, followService.countFollowers(7L));
        assertEquals(1, followService.countFollowing(7L));
    }
}
