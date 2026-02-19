package com.esprit.examen.servicesImpl;

import com.esprit.examen.entities.Badge;
import com.esprit.examen.entities.User;
import com.esprit.examen.repositories.BadgeRepository;
import com.esprit.examen.repositories.UserRepository;
import com.esprit.examen.services.BadgeService;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BadgeServiceImpl implements BadgeService {

    @Resource
    private BadgeRepository badgeRepository;

    @Resource
    private UserRepository userRepository;

    @Override
    public Badge createBadge(Badge badge) {
        return badgeRepository.save(badge);
    }

    @Override
    public Badge getBadgeById(Long id) {
        return badgeRepository.findById(id).orElse(null);
    }

    @Override
    public List<Badge> getAllBadges() {
        return badgeRepository.findAll();
    }

    @Override
    public List<Badge> getBadgesByMaxPoints(Integer points) {
        return badgeRepository.findByRequiredPointsLessThanEqual(points);
    }

    @Override
    public List<Badge> getBadgesByMaxLevel(Integer level) {
        return badgeRepository.findByRequiredLevelLessThanEqual(level);
    }

    @Override
    public Badge updateBadge(Long id, Badge badge) {
        Badge existing = badgeRepository.findById(id).orElse(null);
        if (existing != null) {
            existing.setName(badge.getName());
            existing.setDescription(badge.getDescription());
            existing.setIconUrl(badge.getIconUrl());
            existing.setRequiredPoints(badge.getRequiredPoints());
            existing.setRequiredLevel(badge.getRequiredLevel());
            return badgeRepository.save(existing);
        }
        return null;
    }

    @Override
    public void deleteBadge(Long id) {
        badgeRepository.deleteById(id);
    }

    @Override
    public void assignBadgeToUser(Long badgeId, Long userId) {
        Badge badge = badgeRepository.findById(badgeId).orElse(null);
        User user = userRepository.findById(userId).orElse(null);
        if (badge != null && user != null) {
            user.getBadges().add(badge);
            userRepository.save(user);
        }
    }

    @Override
    public void removeBadgeFromUser(Long badgeId, Long userId) {
        Badge badge = badgeRepository.findById(badgeId).orElse(null);
        User user = userRepository.findById(userId).orElse(null);
        if (badge != null && user != null) {
            user.getBadges().remove(badge);
            userRepository.save(user);
        }
    }
}