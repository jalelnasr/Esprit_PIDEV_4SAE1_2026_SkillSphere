package org.example.formation_service.service;

import org.example.formation_service.domain.entity.Course;
import org.example.formation_service.domain.entity.SubscriptionPlan;
import org.example.formation_service.domain.entity.UserSubscription;
import org.example.formation_service.domain.enums.AccessLevel;
import org.example.formation_service.domain.enums.EnrollmentStatus;
import org.example.formation_service.domain.enums.SubscriptionStatus;
import org.example.formation_service.exception.AccessDeniedException;
import org.example.formation_service.repository.CourseRepository;
import org.example.formation_service.repository.EnrollmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AccessControlServiceTest {

    @Mock private UserSubscriptionService subscriptionService;
    @Mock private CourseRepository courseRepository;
    @Mock private EnrollmentRepository enrollmentRepository;

    @InjectMocks private AccessControlService accessControlService;

    private SubscriptionPlan basicPlan;
    private SubscriptionPlan plusPlan;
    private SubscriptionPlan premiumPlan;
    private UserSubscription activeSubscription;
    private Course basicCourse;
    private Course plusCourse;
    private Course premiumCourse;

    @BeforeEach
    void setUp() {
        // Setup plans
        basicPlan = new SubscriptionPlan();
        basicPlan.setId(1L);
        basicPlan.setName("Basic");
        basicPlan.setAccessLevel(AccessLevel.BASIC);
        basicPlan.setMonthlyEnrollmentLimit(3);

        plusPlan = new SubscriptionPlan();
        plusPlan.setId(2L);
        plusPlan.setName("Plus");
        plusPlan.setAccessLevel(AccessLevel.PLUS);
        plusPlan.setMonthlyEnrollmentLimit(10);

        premiumPlan = new SubscriptionPlan();
        premiumPlan.setId(3L);
        premiumPlan.setName("Premium");
        premiumPlan.setAccessLevel(AccessLevel.PREMIUM);
        premiumPlan.setMonthlyEnrollmentLimit(null); // Unlimited

        // Setup active subscription
        activeSubscription = UserSubscription.builder()
            .id(1L)
            .userId(1L)
            .plan(basicPlan)
            .status(SubscriptionStatus.ACTIVE)
            .startDate(LocalDateTime.now().minusDays(10))
            .endDate(LocalDateTime.now().plusDays(20))
            .build();

        // Setup courses
        basicCourse = new Course();
        basicCourse.setId(100L);
        basicCourse.setTitle("Basic Course");
        basicCourse.setAccessLevel(AccessLevel.BASIC);

        plusCourse = new Course();
        plusCourse.setId(200L);
        plusCourse.setTitle("Plus Course");
        plusCourse.setAccessLevel(AccessLevel.PLUS);

        premiumCourse = new Course();
        premiumCourse.setId(300L);
        premiumCourse.setTitle("Premium Course");
        premiumCourse.setAccessLevel(AccessLevel.PREMIUM);
    }

    // ── checkCanEnroll: No Subscription ───────────────────────────────────────

    @Test
    void checkCanEnroll_shouldThrow_whenNoActiveSubscription() {
        when(subscriptionService.getUserActiveSubscription(1L)).thenReturn(null);

        assertThatThrownBy(() -> accessControlService.checkCanEnroll(1L, 100L))
            .isInstanceOf(AccessDeniedException.class)
            .hasMessageContaining("abonnement actif");
    }

    // ── checkCanEnroll: Expired Subscription ──────────────────────────────────

    @Test
    void checkCanEnroll_shouldThrow_whenSubscriptionExpired() {
        activeSubscription.setEndDate(LocalDateTime.now().minusDays(1)); // Expired
        when(subscriptionService.getUserActiveSubscription(1L)).thenReturn(activeSubscription);
        doNothing().when(subscriptionService).checkAndExpireSubscriptions(1L);

        assertThatThrownBy(() -> accessControlService.checkCanEnroll(1L, 100L))
            .isInstanceOf(AccessDeniedException.class)
            .hasMessageContaining("expiré");

        verify(subscriptionService).checkAndExpireSubscriptions(1L);
    }

    // ── checkCanEnroll: Access Level Checks ───────────────────────────────────

    @Test
    void checkCanEnroll_shouldAllow_basicUserToBasicCourse() {
        when(subscriptionService.getUserActiveSubscription(1L)).thenReturn(activeSubscription);
        when(courseRepository.findById(100L)).thenReturn(Optional.of(basicCourse));
        when(enrollmentRepository.countByUserIdAndEnrolledAtAfterAndStatusNot(
            eq(1L), any(LocalDateTime.class), eq(EnrollmentStatus.CANCELED)
        )).thenReturn(0);

        assertThatCode(() -> accessControlService.checkCanEnroll(1L, 100L))
            .doesNotThrowAnyException();
    }

    @Test
    void checkCanEnroll_shouldThrow_basicUserToPlusCourse() {
        when(subscriptionService.getUserActiveSubscription(1L)).thenReturn(activeSubscription);
        when(courseRepository.findById(200L)).thenReturn(Optional.of(plusCourse));

        assertThatThrownBy(() -> accessControlService.checkCanEnroll(1L, 200L))
            .isInstanceOf(AccessDeniedException.class)
            .hasMessageContaining("Mettez à niveau");
    }

    @Test
    void checkCanEnroll_shouldThrow_basicUserToPremiumCourse() {
        when(subscriptionService.getUserActiveSubscription(1L)).thenReturn(activeSubscription);
        when(courseRepository.findById(300L)).thenReturn(Optional.of(premiumCourse));

        assertThatThrownBy(() -> accessControlService.checkCanEnroll(1L, 300L))
            .isInstanceOf(AccessDeniedException.class)
            .hasMessageContaining("Mettez à niveau");
    }

    @Test
    void checkCanEnroll_shouldAllow_plusUserToBasicCourse() {
        activeSubscription.setPlan(plusPlan);
        when(subscriptionService.getUserActiveSubscription(1L)).thenReturn(activeSubscription);
        when(courseRepository.findById(100L)).thenReturn(Optional.of(basicCourse));
        when(enrollmentRepository.countByUserIdAndEnrolledAtAfterAndStatusNot(
            eq(1L), any(LocalDateTime.class), eq(EnrollmentStatus.CANCELED)
        )).thenReturn(0);

        assertThatCode(() -> accessControlService.checkCanEnroll(1L, 100L))
            .doesNotThrowAnyException();
    }

    @Test
    void checkCanEnroll_shouldAllow_plusUserToPlusCourse() {
        activeSubscription.setPlan(plusPlan);
        when(subscriptionService.getUserActiveSubscription(1L)).thenReturn(activeSubscription);
        when(courseRepository.findById(200L)).thenReturn(Optional.of(plusCourse));
        when(enrollmentRepository.countByUserIdAndEnrolledAtAfterAndStatusNot(
            eq(1L), any(LocalDateTime.class), eq(EnrollmentStatus.CANCELED)
        )).thenReturn(0);

        assertThatCode(() -> accessControlService.checkCanEnroll(1L, 200L))
            .doesNotThrowAnyException();
    }

    @Test
    void checkCanEnroll_shouldThrow_plusUserToPremiumCourse() {
        activeSubscription.setPlan(plusPlan);
        when(subscriptionService.getUserActiveSubscription(1L)).thenReturn(activeSubscription);
        when(courseRepository.findById(300L)).thenReturn(Optional.of(premiumCourse));

        assertThatThrownBy(() -> accessControlService.checkCanEnroll(1L, 300L))
            .isInstanceOf(AccessDeniedException.class)
            .hasMessageContaining("Mettez à niveau");
    }

    @Test
    void checkCanEnroll_shouldAllow_premiumUserToAnyCourse() {
        activeSubscription.setPlan(premiumPlan);
        when(subscriptionService.getUserActiveSubscription(1L)).thenReturn(activeSubscription);
        when(courseRepository.findById(300L)).thenReturn(Optional.of(premiumCourse));

        assertThatCode(() -> accessControlService.checkCanEnroll(1L, 300L))
            .doesNotThrowAnyException();
    }

    // ── checkCanEnroll: Monthly Limit ─────────────────────────────────────────

    @Test
    void checkCanEnroll_shouldThrow_whenMonthlyLimitReached() {
        when(subscriptionService.getUserActiveSubscription(1L)).thenReturn(activeSubscription);
        when(courseRepository.findById(100L)).thenReturn(Optional.of(basicCourse));
        when(enrollmentRepository.countByUserIdAndEnrolledAtAfterAndStatusNot(
            eq(1L), any(LocalDateTime.class), eq(EnrollmentStatus.CANCELED)
        )).thenReturn(3); // Limit is 3

        assertThatThrownBy(() -> accessControlService.checkCanEnroll(1L, 100L))
            .isInstanceOf(AccessDeniedException.class)
            .hasMessageContaining("limite mensuelle");
    }

    @Test
    void checkCanEnroll_shouldAllow_whenBelowMonthlyLimit() {
        when(subscriptionService.getUserActiveSubscription(1L)).thenReturn(activeSubscription);
        when(courseRepository.findById(100L)).thenReturn(Optional.of(basicCourse));
        when(enrollmentRepository.countByUserIdAndEnrolledAtAfterAndStatusNot(
            eq(1L), any(LocalDateTime.class), eq(EnrollmentStatus.CANCELED)
        )).thenReturn(2); // Below limit of 3

        assertThatCode(() -> accessControlService.checkCanEnroll(1L, 100L))
            .doesNotThrowAnyException();
    }

    @Test
    void checkCanEnroll_shouldAllow_whenUnlimitedPlan() {
        activeSubscription.setPlan(premiumPlan); // Unlimited
        when(subscriptionService.getUserActiveSubscription(1L)).thenReturn(activeSubscription);
        when(courseRepository.findById(100L)).thenReturn(Optional.of(basicCourse));

        assertThatCode(() -> accessControlService.checkCanEnroll(1L, 100L))
            .doesNotThrowAnyException();

        verify(enrollmentRepository, never()).countByUserIdAndEnrolledAtAfterAndStatusNot(
            anyLong(), any(), any()
        );
    }

    // ── getMonthlyEnrollmentCount ─────────────────────────────────────────────

    @Test
    void getMonthlyEnrollmentCount_shouldReturnCorrectCount() {
        when(enrollmentRepository.countByUserIdAndEnrolledAtAfterAndStatusNot(
            eq(1L), any(LocalDateTime.class), eq(EnrollmentStatus.CANCELED)
        )).thenReturn(5);

        int count = accessControlService.getMonthlyEnrollmentCount(1L);

        assertThat(count).isEqualTo(5);
    }

    @Test
    void getMonthlyEnrollmentCount_shouldExcludeCanceledEnrollments() {
        when(enrollmentRepository.countByUserIdAndEnrolledAtAfterAndStatusNot(
            eq(1L), any(LocalDateTime.class), eq(EnrollmentStatus.CANCELED)
        )).thenReturn(3);

        int count = accessControlService.getMonthlyEnrollmentCount(1L);

        assertThat(count).isEqualTo(3);
        verify(enrollmentRepository).countByUserIdAndEnrolledAtAfterAndStatusNot(
            eq(1L), any(LocalDateTime.class), eq(EnrollmentStatus.CANCELED)
        );
    }

    // ── hasActiveSubscription ─────────────────────────────────────────────────

    @Test
    void hasActiveSubscription_shouldReturnTrue_whenActive() {
        when(subscriptionService.getUserActiveSubscription(1L)).thenReturn(activeSubscription);

        boolean result = accessControlService.hasActiveSubscription(1L);

        assertThat(result).isTrue();
    }

    @Test
    void hasActiveSubscription_shouldReturnFalse_whenNoActive() {
        when(subscriptionService.getUserActiveSubscription(1L)).thenReturn(null);

        boolean result = accessControlService.hasActiveSubscription(1L);

        assertThat(result).isFalse();
    }

    // ── canModifyFormation ────────────────────────────────────────────────────

    @Test
    void canModifyFormation_shouldReturnTrue_forAdmin() {
        boolean result = accessControlService.canModifyFormation(100L, 1L, "ADMIN");

        assertThat(result).isTrue();
        verify(courseRepository, never()).findById(anyLong());
    }

    @Test
    void canModifyFormation_shouldReturnTrue_forOwner() {
        basicCourse.setCreatedBy(1L);
        when(courseRepository.findById(100L)).thenReturn(Optional.of(basicCourse));

        boolean result = accessControlService.canModifyFormation(100L, 1L, "FORMATEUR");

        assertThat(result).isTrue();
    }

    @Test
    void canModifyFormation_shouldReturnFalse_forNonOwner() {
        basicCourse.setCreatedBy(2L); // Different user
        when(courseRepository.findById(100L)).thenReturn(Optional.of(basicCourse));

        boolean result = accessControlService.canModifyFormation(100L, 1L, "FORMATEUR");

        assertThat(result).isFalse();
    }

    // ── canViewFormationContent ───────────────────────────────────────────────

    @Test
    void canViewFormationContent_shouldReturnTrue_forAdmin() {
        boolean result = accessControlService.canViewFormationContent(100L, 1L, "ADMIN");

        assertThat(result).isTrue();
    }

    @Test
    void canViewFormationContent_shouldReturnTrue_forOwner() {
        basicCourse.setCreatedBy(1L);
        when(courseRepository.findById(100L)).thenReturn(Optional.of(basicCourse));

        boolean result = accessControlService.canViewFormationContent(100L, 1L, "FORMATEUR");

        assertThat(result).isTrue();
    }

    @Test
    void canViewFormationContent_shouldReturnTrue_forEnrolledStudent() {
        basicCourse.setCreatedBy(2L); // Not owner
        when(courseRepository.findById(100L)).thenReturn(Optional.of(basicCourse));
        when(enrollmentRepository.existsByCourseIdAndUserIdAndStatus(
            100L, 1L, EnrollmentStatus.ACTIVE
        )).thenReturn(true);

        boolean result = accessControlService.canViewFormationContent(100L, 1L, "APPRENANT");

        assertThat(result).isTrue();
    }

    @Test
    void canViewFormationContent_shouldReturnFalse_forNonEnrolledStudent() {
        basicCourse.setCreatedBy(2L); // Not owner
        when(courseRepository.findById(100L)).thenReturn(Optional.of(basicCourse));
        when(enrollmentRepository.existsByCourseIdAndUserIdAndStatus(
            100L, 1L, EnrollmentStatus.ACTIVE
        )).thenReturn(false);

        boolean result = accessControlService.canViewFormationContent(100L, 1L, "APPRENANT");

        assertThat(result).isFalse();
    }

    // ── isUserEnrolledInFormation ─────────────────────────────────────────────

    @Test
    void isUserEnrolledInFormation_shouldReturnTrue_whenEnrolled() {
        when(enrollmentRepository.existsByCourseIdAndUserIdAndStatus(
            100L, 1L, EnrollmentStatus.ACTIVE
        )).thenReturn(true);

        boolean result = accessControlService.isUserEnrolledInFormation(100L, 1L);

        assertThat(result).isTrue();
    }

    @Test
    void isUserEnrolledInFormation_shouldReturnFalse_whenNotEnrolled() {
        when(enrollmentRepository.existsByCourseIdAndUserIdAndStatus(
            100L, 1L, EnrollmentStatus.ACTIVE
        )).thenReturn(false);

        boolean result = accessControlService.isUserEnrolledInFormation(100L, 1L);

        assertThat(result).isFalse();
    }
}
