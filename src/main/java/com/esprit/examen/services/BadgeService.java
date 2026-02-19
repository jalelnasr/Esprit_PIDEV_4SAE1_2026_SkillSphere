package com.esprit.examen.services;

import com.esprit.examen.entities.Badge;

import java.util.List;

public interface BadgeService {

    Badge createBadge(Badge badge);

    Badge getBadgeById(Long id);

    List<Badge> getAllBadges();

    List<Badge> getBadgesByMaxPoints(Integer points);

    List<Badge> getBadgesByMaxLevel(Integer level);

    Badge updateBadge(Long id, Badge badge);

    void deleteBadge(Long id);

    void assignBadgeToUser(Long badgeId, Long userId);

    void removeBadgeFromUser(Long badgeId, Long userId);
}