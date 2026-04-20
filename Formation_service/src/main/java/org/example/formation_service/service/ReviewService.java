package org.example.formation_service.service;

import lombok.RequiredArgsConstructor;
import org.example.formation_service.domain.entity.CourseReview;
import org.example.formation_service.exception.BusinessException;
import org.example.formation_service.repository.CourseReviewRepository;
import org.example.formation_service.repository.EnrollmentRepository;
import org.example.formation_service.util.ContentModerationUtil;
import org.example.formation_service.web.dto.CourseRatingStats;
import org.example.formation_service.web.dto.ReviewRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReviewService {
    
    private final CourseReviewRepository reviewRepository;
    private final EnrollmentRepository enrollmentRepository;
    
    @Transactional
    public CourseReview addOrUpdateReview(Long courseId, ReviewRequest request) {
        // Vérifier que l'utilisateur est inscrit
        boolean isEnrolled = enrollmentRepository.existsByUserIdAndCourseId(request.getUserId(), courseId);
        if (!isEnrolled) {
            throw new BusinessException("NOT_ENROLLED", "Vous devez être inscrit pour donner un avis");
        }
        
        // Valider le contenu du commentaire (vérifier les mots inappropriés)
        if (request.getComment() != null && !request.getComment().trim().isEmpty()) {
            try {
                ContentModerationUtil.validateContent(request.getComment());
            } catch (IllegalArgumentException e) {
                throw new BusinessException("INAPPROPRIATE_CONTENT", e.getMessage());
            }
        }
        
        // Chercher si un avis existe déjà
        return reviewRepository.findByUserIdAndCourseId(request.getUserId(), courseId)
            .map(existing -> {
                // Mettre à jour l'avis existant
                existing.setRating(request.getRating());
                existing.setComment(request.getComment());
                return reviewRepository.save(existing);
            })
            .orElseGet(() -> {
                // Créer un nouvel avis
                CourseReview review = CourseReview.builder()
                    .courseId(courseId)
                    .userId(request.getUserId())
                    .rating(request.getRating())
                    .comment(request.getComment())
                    .build();
                return reviewRepository.save(review);
            });
    }
    
    public CourseRatingStats getCourseRatingStats(Long courseId) {
        Double avgRating = reviewRepository.getAverageRatingByCourseId(courseId);
        long totalReviews = reviewRepository.countByCourseId(courseId);
        
        return CourseRatingStats.builder()
            .courseId(courseId)
            .averageRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0)
            .totalReviews(totalReviews)
            .build();
    }
    
    public CourseReview getUserReview(Long courseId, Long userId) {
        return reviewRepository.findByUserIdAndCourseId(userId, courseId)
            .orElse(null);
    }
    
    public java.util.List<CourseReview> getAllReviews(Long courseId) {
        return reviewRepository.findByCourseIdOrderByCreatedAtDesc(courseId);
    }
}
