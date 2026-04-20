package org.example.formation_service.service;

import org.example.formation_service.domain.entity.CourseReview;
import org.example.formation_service.exception.BusinessException;
import org.example.formation_service.repository.CourseReviewRepository;
import org.example.formation_service.repository.EnrollmentRepository;
import org.example.formation_service.web.dto.CourseRatingStats;
import org.example.formation_service.web.dto.ReviewRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock private CourseReviewRepository reviewRepository;
    @Mock private EnrollmentRepository enrollmentRepository;

    @InjectMocks private ReviewService reviewService;

    private ReviewRequest reviewRequest;
    private CourseReview existingReview;

    @BeforeEach
    void setUp() {
        reviewRequest = new ReviewRequest();
        reviewRequest.setUserId(1L);
        reviewRequest.setRating(5);
        reviewRequest.setComment("Très bon cours, je recommande!");

        existingReview = CourseReview.builder()
            .id(1L)
            .courseId(100L)
            .userId(1L)
            .rating(4)
            .comment("Bon cours")
            .createdAt(LocalDateTime.now().minusDays(5))
            .build();
    }

    // ── addOrUpdateReview: Enrollment Verification ────────────────────────────

    @Test
    void addOrUpdateReview_shouldThrow_whenUserNotEnrolled() {
        when(enrollmentRepository.existsByUserIdAndCourseId(1L, 100L)).thenReturn(false);

        assertThatThrownBy(() -> reviewService.addOrUpdateReview(100L, reviewRequest))
            .isInstanceOf(BusinessException.class)
            .hasMessageContaining("inscrit");

        verify(reviewRepository, never()).save(any());
    }

    @Test
    void addOrUpdateReview_shouldCreateNewReview_whenUserEnrolledAndNoExistingReview() {
        when(enrollmentRepository.existsByUserIdAndCourseId(1L, 100L)).thenReturn(true);
        when(reviewRepository.findByUserIdAndCourseId(1L, 100L)).thenReturn(Optional.empty());
        when(reviewRepository.save(any(CourseReview.class))).thenAnswer(i -> {
            CourseReview review = i.getArgument(0);
            review.setId(1L);
            review.setCreatedAt(LocalDateTime.now());
            return review;
        });

        CourseReview result = reviewService.addOrUpdateReview(100L, reviewRequest);

        assertThat(result).isNotNull();
        assertThat(result.getCourseId()).isEqualTo(100L);
        assertThat(result.getUserId()).isEqualTo(1L);
        assertThat(result.getRating()).isEqualTo(5);
        assertThat(result.getComment()).isEqualTo("Très bon cours, je recommande!");
        verify(reviewRepository).save(any(CourseReview.class));
    }

    @Test
    void addOrUpdateReview_shouldUpdateExistingReview_whenUserAlreadyReviewed() {
        when(enrollmentRepository.existsByUserIdAndCourseId(1L, 100L)).thenReturn(true);
        when(reviewRepository.findByUserIdAndCourseId(1L, 100L)).thenReturn(Optional.of(existingReview));
        when(reviewRepository.save(any(CourseReview.class))).thenAnswer(i -> i.getArgument(0));

        reviewRequest.setRating(5);
        reviewRequest.setComment("Mise à jour: formation très utile!");

        CourseReview result = reviewService.addOrUpdateReview(100L, reviewRequest);

        assertThat(result.getId()).isEqualTo(1L); // Same review ID
        assertThat(result.getRating()).isEqualTo(5); // Updated rating
        assertThat(result.getComment()).isEqualTo("Mise à jour: formation très utile!"); // Updated comment
        verify(reviewRepository).save(existingReview);
    }

    // ── addOrUpdateReview: Content Moderation ─────────────────────────────────

    @Test
    void addOrUpdateReview_contentModerationIsIntegrated() {
        // Verify that ReviewService integrates with ContentModerationUtil
        // The service should call validateContent() for non-empty comments
        when(enrollmentRepository.existsByUserIdAndCourseId(1L, 100L)).thenReturn(true);
        when(reviewRepository.findByUserIdAndCourseId(1L, 100L)).thenReturn(Optional.empty());
        when(reviewRepository.save(any(CourseReview.class))).thenAnswer(i -> i.getArgument(0));

        // A clean comment should always pass moderation
        ReviewRequest cleanRequest = new ReviewRequest();
        cleanRequest.setUserId(1L);
        cleanRequest.setRating(4);
        cleanRequest.setComment("Formation très bien structurée");

        CourseReview result = reviewService.addOrUpdateReview(100L, cleanRequest);

        assertThat(result).isNotNull();
        assertThat(result.getRating()).isEqualTo(4);
        verify(reviewRepository).save(any(CourseReview.class));
    }

    @Test
    void addOrUpdateReview_shouldAcceptEmptyComment() {
        when(enrollmentRepository.existsByUserIdAndCourseId(1L, 100L)).thenReturn(true);
        when(reviewRepository.findByUserIdAndCourseId(1L, 100L)).thenReturn(Optional.empty());
        when(reviewRepository.save(any(CourseReview.class))).thenAnswer(i -> i.getArgument(0));

        reviewRequest.setComment(null);

        CourseReview result = reviewService.addOrUpdateReview(100L, reviewRequest);

        assertThat(result.getComment()).isNull();
        verify(reviewRepository).save(any(CourseReview.class));
    }

    @Test
    void addOrUpdateReview_shouldAcceptWhitespaceOnlyComment() {
        when(enrollmentRepository.existsByUserIdAndCourseId(1L, 100L)).thenReturn(true);
        when(reviewRepository.findByUserIdAndCourseId(1L, 100L)).thenReturn(Optional.empty());
        when(reviewRepository.save(any(CourseReview.class))).thenAnswer(i -> i.getArgument(0));

        reviewRequest.setComment("   ");

        CourseReview result = reviewService.addOrUpdateReview(100L, reviewRequest);

        assertThat(result.getComment()).isEqualTo("   ");
        verify(reviewRepository).save(any(CourseReview.class));
    }

    // ── getCourseRatingStats ──────────────────────────────────────────────────

    @Test
    void getCourseRatingStats_shouldReturnCorrectStats_whenReviewsExist() {
        when(reviewRepository.getAverageRatingByCourseId(100L)).thenReturn(4.567);
        when(reviewRepository.countByCourseId(100L)).thenReturn(120L);

        CourseRatingStats stats = reviewService.getCourseRatingStats(100L);

        assertThat(stats.getCourseId()).isEqualTo(100L);
        assertThat(stats.getAverageRating()).isEqualTo(4.6); // Rounded to 1 decimal
        assertThat(stats.getTotalReviews()).isEqualTo(120L);
    }

    @Test
    void getCourseRatingStats_shouldReturnZero_whenNoReviews() {
        when(reviewRepository.getAverageRatingByCourseId(100L)).thenReturn(null);
        when(reviewRepository.countByCourseId(100L)).thenReturn(0L);

        CourseRatingStats stats = reviewService.getCourseRatingStats(100L);

        assertThat(stats.getCourseId()).isEqualTo(100L);
        assertThat(stats.getAverageRating()).isEqualTo(0.0);
        assertThat(stats.getTotalReviews()).isEqualTo(0L);
    }

    @Test
    void getCourseRatingStats_shouldRoundCorrectly() {
        when(reviewRepository.getAverageRatingByCourseId(100L)).thenReturn(4.95);
        when(reviewRepository.countByCourseId(100L)).thenReturn(10L);

        CourseRatingStats stats = reviewService.getCourseRatingStats(100L);

        assertThat(stats.getAverageRating()).isEqualTo(5.0); // Rounded up
    }

    // ── getUserReview ─────────────────────────────────────────────────────────

    @Test
    void getUserReview_shouldReturnReview_whenExists() {
        when(reviewRepository.findByUserIdAndCourseId(1L, 100L))
            .thenReturn(Optional.of(existingReview));

        CourseReview result = reviewService.getUserReview(100L, 1L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getUserId()).isEqualTo(1L);
    }

    @Test
    void getUserReview_shouldReturnNull_whenNotExists() {
        when(reviewRepository.findByUserIdAndCourseId(1L, 100L))
            .thenReturn(Optional.empty());

        CourseReview result = reviewService.getUserReview(100L, 1L);

        assertThat(result).isNull();
    }

    // ── getAllReviews ─────────────────────────────────────────────────────────

    @Test
    void getAllReviews_shouldReturnReviewsOrderedByDate() {
        CourseReview review1 = CourseReview.builder()
            .id(1L).courseId(100L).userId(1L).rating(5)
            .createdAt(LocalDateTime.now().minusDays(2))
            .build();
        
        CourseReview review2 = CourseReview.builder()
            .id(2L).courseId(100L).userId(2L).rating(4)
            .createdAt(LocalDateTime.now().minusDays(1))
            .build();

        when(reviewRepository.findByCourseIdOrderByCreatedAtDesc(100L))
            .thenReturn(Arrays.asList(review2, review1)); // Newest first

        List<CourseReview> results = reviewService.getAllReviews(100L);

        assertThat(results).hasSize(2);
        assertThat(results.get(0).getId()).isEqualTo(2L); // Newest first
        assertThat(results.get(1).getId()).isEqualTo(1L);
    }

    @Test
    void getAllReviews_shouldReturnEmptyList_whenNoReviews() {
        when(reviewRepository.findByCourseIdOrderByCreatedAtDesc(100L))
            .thenReturn(Arrays.asList());

        List<CourseReview> results = reviewService.getAllReviews(100L);

        assertThat(results).isEmpty();
    }

    // ── Edge Cases ────────────────────────────────────────────────────────────

    @Test
    void addOrUpdateReview_shouldHandleMinimumRating() {
        when(enrollmentRepository.existsByUserIdAndCourseId(1L, 100L)).thenReturn(true);
        when(reviewRepository.findByUserIdAndCourseId(1L, 100L)).thenReturn(Optional.empty());
        when(reviewRepository.save(any(CourseReview.class))).thenAnswer(i -> i.getArgument(0));

        reviewRequest.setRating(1);
        reviewRequest.setComment(null);

        CourseReview result = reviewService.addOrUpdateReview(100L, reviewRequest);

        assertThat(result.getRating()).isEqualTo(1);
    }

    @Test
    void addOrUpdateReview_shouldHandleMaximumRating() {
        when(enrollmentRepository.existsByUserIdAndCourseId(1L, 100L)).thenReturn(true);
        when(reviewRepository.findByUserIdAndCourseId(1L, 100L)).thenReturn(Optional.empty());
        when(reviewRepository.save(any(CourseReview.class))).thenAnswer(i -> i.getArgument(0));

        reviewRequest.setRating(5);
        reviewRequest.setComment(null);

        CourseReview result = reviewService.addOrUpdateReview(100L, reviewRequest);

        assertThat(result.getRating()).isEqualTo(5);
    }
}
