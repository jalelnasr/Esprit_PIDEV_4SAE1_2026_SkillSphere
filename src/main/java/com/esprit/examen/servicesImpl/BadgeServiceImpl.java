package com.esprit.examen.servicesImpl;

import com.esprit.examen.entities.Badge;
import com.esprit.examen.entities.User;
import com.esprit.examen.exceptions.ResourceNotFoundException;
import com.esprit.examen.repositories.BadgeRepository;
import com.esprit.examen.repositories.UserRepository;
import com.esprit.examen.services.BadgeService;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        return badgeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Badge not found: " + id));
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
        Badge existing = badgeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Badge not found: " + id));
        existing.setName(badge.getName());
        existing.setDescription(badge.getDescription());
        existing.setIconUrl(badge.getIconUrl());
        existing.setRequiredPoints(badge.getRequiredPoints());
        existing.setRequiredLevel(badge.getRequiredLevel());
        return badgeRepository.save(existing);
    }

    @Override
    public void deleteBadge(Long id) {
        if (!badgeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Badge not found: " + id);
        }
        badgeRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void assignBadgeToUser(Long badgeId, Long userId) {
        Badge badge = badgeRepository.findById(badgeId)
                .orElseThrow(() -> new ResourceNotFoundException("Badge not found: " + badgeId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        user.getBadges().add(badge);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void removeBadgeFromUser(Long badgeId, Long userId) {
        Badge badge = badgeRepository.findById(badgeId)
                .orElseThrow(() -> new ResourceNotFoundException("Badge not found: " + badgeId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        user.getBadges().remove(badge);
        userRepository.save(user);
    }
}
