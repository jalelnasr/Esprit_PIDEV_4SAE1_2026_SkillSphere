package org.example.formation_service.service;

import lombok.RequiredArgsConstructor;
import org.example.formation_service.domain.entity.Course;
import org.example.formation_service.domain.entity.UserSubscription;
import org.example.formation_service.domain.enums.AccessLevel;
import org.example.formation_service.domain.enums.EnrollmentStatus;
import org.example.formation_service.exception.AccessDeniedException;
import org.example.formation_service.repository.CourseRepository;
import org.example.formation_service.repository.EnrollmentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AccessControlService {
    
    private final UserSubscriptionService subscriptionService;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    
    public void checkCanEnroll(Long userId, Long courseId) {
        // 1. Get user's active subscription
        UserSubscription subscription = subscriptionService.getUserActiveSubscription(userId);
        if (subscription == null) {
            throw new AccessDeniedException(
                "PLAN_REQUIRED",
                "Vous devez avoir un abonnement actif pour vous inscrire à ce cours"
            );
        }
        
        // 2. Check if subscription expired (lazy expiration)
        if (subscription.getEndDate() != null && subscription.getEndDate().isBefore(LocalDateTime.now())) {
            subscriptionService.checkAndExpireSubscriptions(userId);
            throw new AccessDeniedException(
                "PLAN_REQUIRED",
                "Votre abonnement a expiré"
            );
        }
        
        // 3. Get course and check access level
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Course not found"));
        
        AccessLevel userLevel = subscription.getPlan().getAccessLevel();
        AccessLevel courseLevel = course.getAccessLevel();
        
        if (!canAccessLevel(userLevel, courseLevel)) {
            String requiredPlan = getRequiredPlanName(courseLevel);
            throw new AccessDeniedException(
                "UPGRADE_REQUIRED",
                "Mettez à niveau votre abonnement pour accéder à ce cours",
                requiredPlan
            );
        }
        
        // 4. Check monthly limit
        Integer limit = subscription.getPlan().getMonthlyEnrollmentLimit();
        if (limit != null) {  // NULL = unlimited
            int count = getMonthlyEnrollmentCount(userId);
            if (count >= limit) {
                throw new AccessDeniedException(
                    "MONTHLY_LIMIT_REACHED",
                    "Vous avez atteint votre limite mensuelle d'inscriptions",
                    count,
                    limit
                );
            }
        }
    }
    
    private boolean canAccessLevel(AccessLevel userLevel, AccessLevel courseLevel) {
        if (userLevel == AccessLevel.PREMIUM) return true;
        if (userLevel == AccessLevel.PLUS) return courseLevel != AccessLevel.PREMIUM;
        if (userLevel == AccessLevel.BASIC) return courseLevel == AccessLevel.BASIC;
        return false;
    }
    
    private String getRequiredPlanName(AccessLevel courseLevel) {
        return switch (courseLevel) {
            case PREMIUM -> "Premium";
            case PLUS -> "Plus";
            case BASIC -> "Basic";
        };
    }
    
    public int getMonthlyEnrollmentCount(Long userId) {
        LocalDateTime startOfMonth = LocalDateTime.now()
            .withDayOfMonth(1)
            .withHour(0)
            .withMinute(0)
            .withSecond(0)
            .withNano(0);
        
        return enrollmentRepository.countByUserIdAndEnrolledAtAfterAndStatusNot(
            userId,
            startOfMonth,
            EnrollmentStatus.CANCELED
        );
    }
    
    public boolean hasActiveSubscription(Long userId) {
        UserSubscription subscription = subscriptionService.getUserActiveSubscription(userId);
        return subscription != null;
    }
    
    /**
     * Check if user can modify a formation (owner or admin)
     */
    public boolean canModifyFormation(Long courseId, Long userId, String userRole) {
        if ("ADMIN".equals(userRole)) {
            return true;
        }
        
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Course not found"));
        
        return course.getCreatedBy() != null && course.getCreatedBy().equals(userId);
    }
    
    /**
     * Check if user can view formation content (enrolled OR owner OR admin)
     */
    public boolean canViewFormationContent(Long courseId, Long userId, String userRole) {
        // Admin can view everything
        if ("ADMIN".equals(userRole)) {
            return true;
        }
        
        // Check if user is the owner
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Course not found"));
        
        if (course.getCreatedBy() != null && course.getCreatedBy().equals(userId)) {
            return true;
        }
        
        // Check if user is enrolled
        return isUserEnrolledInFormation(courseId, userId);
    }
    
    /**
     * Check if user is enrolled in any active session of the formation
     */
    public boolean isUserEnrolledInFormation(Long courseId, Long userId) {
        return enrollmentRepository.existsByCourseIdAndUserIdAndStatus(
            courseId,
            userId,
            EnrollmentStatus.ACTIVE
        );
    }
}
