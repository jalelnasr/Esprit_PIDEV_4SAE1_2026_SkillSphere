package com.esprit.examen.services;

import com.esprit.examen.dto.NotificationEventDTO;
import com.esprit.examen.entities.Follow;
import com.esprit.examen.entities.Message;
import com.esprit.examen.entities.Post;
import com.esprit.examen.entities.PostLike;
import com.esprit.examen.repositories.FollowRepository;
import com.esprit.examen.repositories.MessageRepository;
import com.esprit.examen.repositories.PostLikeRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificationHistoryServiceTest {

    @Mock
    private PostLikeRepository postLikeRepository;

    @Mock
    private FollowRepository followRepository;

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private NotificationHistoryService notificationHistoryService;

    @Test
    void getHistoryForUser_combinesSortsAndLimitsEvents() {
        LocalDateTime now = LocalDateTime.now();

        PostLike like = new PostLike();
        like.setUserId(2L);
        like.setCreatedAt(now.minusMinutes(1));
        Post likedPost = new Post();
        likedPost.setPostId(50L);
        like.setPost(likedPost);

        Follow follow = new Follow();
        follow.setFollowerId(3L);
        follow.setCreatedAt(now.minusMinutes(2));

        Message message = new Message();
        message.setMessageId(70L);
        message.setSenderId(4L);
        message.setCreatedAt(now.minusMinutes(3));

        when(postLikeRepository.findReceivedLikesSince(eq(1L), any(LocalDateTime.class), any(Pageable.class))).thenReturn(List.of(like));
        when(followRepository.findByFollowingIdAndCreatedAtAfterOrderByCreatedAtDesc(eq(1L), any(LocalDateTime.class), any(Pageable.class)))
            .thenReturn(List.of(follow));
        when(messageRepository.findByReceiverIdAndCreatedAtAfterOrderByCreatedAtDesc(eq(1L), any(LocalDateTime.class), any(Pageable.class)))
            .thenReturn(List.of(message));

        when(userService.getDisplayName(eq(2L), eq("token"))).thenReturn("Alice");
        when(userService.getDisplayName(eq(3L), eq("token"))).thenReturn("Bob");
        when(userService.getDisplayName(eq(4L), eq("token"))).thenReturn("Charlie");

        List<NotificationEventDTO> notifications = notificationHistoryService.getHistoryForUser(1L, now.minusDays(1), 2, "token");

        assertEquals(2, notifications.size());
        assertEquals("like", notifications.get(0).type());
        assertEquals("follow", notifications.get(1).type());
    }

    @Test
    void getHistoryForUser_usesDisplayNameCacheForRepeatedActor() {
        LocalDateTime now = LocalDateTime.now();

        PostLike like = new PostLike();
        like.setUserId(5L);
        like.setCreatedAt(now.minusMinutes(1));
        Post post = new Post();
        post.setPostId(1L);
        like.setPost(post);

        Follow follow = new Follow();
        follow.setFollowerId(5L);
        follow.setCreatedAt(now.minusMinutes(2));

        when(postLikeRepository.findReceivedLikesSince(eq(1L), any(LocalDateTime.class), any(Pageable.class))).thenReturn(List.of(like));
        when(followRepository.findByFollowingIdAndCreatedAtAfterOrderByCreatedAtDesc(eq(1L), any(LocalDateTime.class), any(Pageable.class)))
            .thenReturn(List.of(follow));
        when(messageRepository.findByReceiverIdAndCreatedAtAfterOrderByCreatedAtDesc(eq(1L), any(LocalDateTime.class), any(Pageable.class)))
            .thenReturn(List.of());

        when(userService.getDisplayName(eq(5L), eq("token"))).thenReturn("Same User");

        notificationHistoryService.getHistoryForUser(1L, now.minusDays(1), 10, "token");

        verify(userService, times(1)).getDisplayName(eq(5L), eq("token"));
    }
}
