package com.esprit.examen.services;

import com.esprit.examen.dto.NotificationEventDTO;
import com.esprit.examen.entities.Follow;
import com.esprit.examen.entities.Message;
import com.esprit.examen.entities.PostLike;
import com.esprit.examen.repositories.FollowRepository;
import com.esprit.examen.repositories.MessageRepository;
import com.esprit.examen.repositories.PostLikeRepository;
import jakarta.annotation.Resource;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class NotificationHistoryService {

    @Resource
    private PostLikeRepository postLikeRepository;

    @Resource
    private FollowRepository followRepository;

    @Resource
    private MessageRepository messageRepository;

    @Resource
    private UserService userService;

    public List<NotificationEventDTO> getHistoryForUser(Long userId, LocalDateTime since, int limit, String tokenOrAuthorizationHeader) {
        int normalizedLimit = normalizeLimit(limit);
        LocalDateTime effectiveSince = since != null ? since : LocalDateTime.now().minusDays(7);
        int fetchPerType = Math.min(120, Math.max(normalizedLimit, 40));
        Pageable pageable = PageRequest.of(0, fetchPerType);

        List<PostLike> likes = postLikeRepository.findReceivedLikesSince(userId, effectiveSince, pageable);
        List<Follow> follows = followRepository.findByFollowingIdAndCreatedAtAfterOrderByCreatedAtDesc(userId, effectiveSince, pageable);
        List<Message> messages = messageRepository.findByReceiverIdAndCreatedAtAfterOrderByCreatedAtDesc(userId, effectiveSince, pageable);

        Map<Long, String> actorNameCache = new HashMap<>();
        List<NotificationEventDTO> notifications = new ArrayList<>(likes.size() + follows.size() + messages.size());

        for (PostLike like : likes) {
            Long actorUserId = like.getUserId();
            if (actorUserId == null || actorUserId.equals(userId)) {
                continue;
            }

            Long postId = like.getPost() != null ? like.getPost().getPostId() : null;
            notifications.add(new NotificationEventDTO(
                    "like",
                    resolveActorName(actorUserId, tokenOrAuthorizationHeader, actorNameCache) + " liked your post",
                    actorUserId,
                    postId,
                    null,
                    formatCreatedAt(like.getCreatedAt())
            ));
        }

        for (Follow follow : follows) {
            Long actorUserId = follow.getFollowerId();
            if (actorUserId == null || actorUserId.equals(userId)) {
                continue;
            }

            notifications.add(new NotificationEventDTO(
                    "follow",
                    resolveActorName(actorUserId, tokenOrAuthorizationHeader, actorNameCache) + " started following you",
                    actorUserId,
                    null,
                    null,
                    formatCreatedAt(follow.getCreatedAt())
            ));
        }

        for (Message message : messages) {
            Long actorUserId = message.getSenderId();
            if (actorUserId == null || actorUserId.equals(userId)) {
                continue;
            }

            notifications.add(new NotificationEventDTO(
                    "message",
                    resolveActorName(actorUserId, tokenOrAuthorizationHeader, actorNameCache) + " sent you a message",
                    actorUserId,
                    null,
                    message.getMessageId(),
                    formatCreatedAt(message.getCreatedAt())
            ));
        }

        notifications.sort((left, right) -> {
            LocalDateTime leftAt = parseCreatedAt(left.createdAt());
            LocalDateTime rightAt = parseCreatedAt(right.createdAt());

            if (leftAt == null && rightAt == null) {
                return 0;
            }
            if (leftAt == null) {
                return 1;
            }
            if (rightAt == null) {
                return -1;
            }

            return rightAt.compareTo(leftAt);
        });

        if (notifications.size() <= normalizedLimit) {
            return notifications;
        }

        return new ArrayList<>(notifications.subList(0, normalizedLimit));
    }

    private int normalizeLimit(int requestedLimit) {
        if (requestedLimit <= 0) {
            return 50;
        }
        return Math.min(requestedLimit, 100);
    }

    private String resolveActorName(Long actorUserId, String tokenOrAuthorizationHeader, Map<Long, String> cache) {
        return cache.computeIfAbsent(actorUserId, id -> userService.getDisplayName(id, tokenOrAuthorizationHeader));
    }

    private String formatCreatedAt(LocalDateTime createdAt) {
        return createdAt != null ? createdAt.toString() : LocalDateTime.now().toString();
    }

    private LocalDateTime parseCreatedAt(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        try {
            return LocalDateTime.parse(value.trim());
        } catch (RuntimeException ignored) {
            return null;
        }
    }
}
