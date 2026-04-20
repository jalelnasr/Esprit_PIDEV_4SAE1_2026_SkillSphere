import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { MyCoursesComponent } from './my-courses.component';
import { FormationService, CourseRatingStats, CourseReview, ReviewRequest } from '../../../../core/services/formation.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Course, Enrollment, EnrollmentStatus, CourseLevel, CourseStatus, AccessLevel } from '../../../../shared/models/formation.model';

describe('MyCoursesComponent', () => {
  let component: MyCoursesComponent;
  let fixture: ComponentFixture<MyCoursesComponent>;
  let formationService: jasmine.SpyObj<FormationService>;
  let authService: jasmine.SpyObj<AuthService>;
  let toastService: jasmine.SpyObj<ToastService>;

  const mockUser = { idUser: 100, email: 'test@example.com', role: 'APPRENANT' };

  const mockCourse: Course = {
    id: 1,
    title: 'Java Basics',
    description: 'Learn Java',
    level: CourseLevel.BEGINNER,
    language: 'French',
    status: CourseStatus.PUBLISHED,
    createdBy: 10,
    accessLevel: AccessLevel.BASIC,
    durationMinutes: 120,
    createdAt: new Date().toISOString()
  };

  const mockEnrollments: Enrollment[] = [
    {
      id: 1,
      userId: 100,
      courseId: 1,
      courseTitle: 'Java Basics',
      inscriptionDate: new Date().toISOString(),
      status: EnrollmentStatus.ACTIVE,
      completionPercent: 50
    }
  ];

  const mockRatingStats: CourseRatingStats = {
    courseId: 1,
    averageRating: 4.6,
    totalReviews: 120
  };

  const mockReview: CourseReview = {
    id: 1,
    courseId: 1,
    userId: 100,
    rating: 4,
    comment: 'Good course',
    createdAt: new Date().toISOString()
  };

  const currentUserSubject = new BehaviorSubject<any>(mockUser);

  beforeEach(async () => {
    const formationSpy = jasmine.createSpyObj('FormationService', [
      'getUserEnrollments',
      'getCourseById',
      'getCourseRatingStats',
      'getMyReview',
      'addOrUpdateReview'
    ]);
    const authSpy = jasmine.createSpyObj('AuthService', ['getUserRole', 'getToken', 'getCurrentUser'], {
      currentUser$: currentUserSubject.asObservable()
    });
    authSpy.getCurrentUser.and.returnValue(mockUser);
    authSpy.getUserRole.and.returnValue('APPRENANT');
    authSpy.getToken.and.returnValue('mock-token');
    const toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error']);

    formationSpy.getUserEnrollments.and.returnValue(of(mockEnrollments));
    formationSpy.getCourseById.and.returnValue(of(mockCourse));
    formationSpy.getCourseRatingStats.and.returnValue(of(mockRatingStats));
    formationSpy.getMyReview.and.returnValue(of(null));

    await TestBed.configureTestingModule({
      imports: [
        MyCoursesComponent,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        { provide: FormationService, useValue: formationSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: ToastService, useValue: toastSpy }
      ]
    }).compileComponents();

    formationService = TestBed.inject(FormationService) as jasmine.SpyObj<FormationService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;

    fixture = TestBed.createComponent(MyCoursesComponent);
    component = fixture.componentInstance;
  });

  // ── Creation ──────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty enrolledCourses', () => {
    expect(component.enrolledCourses).toEqual([]);
    expect(component.loading).toBeTrue();
  });

  // ── ngOnInit ──────────────────────────────────────────────────────────────

  it('should load enrolled courses on init when user is logged in', fakeAsync(() => {
    fixture.detectChanges();
    tick(100);

    expect(formationService.getUserEnrollments).toHaveBeenCalledWith(100);
  }));

  it('should set loading to false when no user', fakeAsync(() => {
    currentUserSubject.next(null);
    fixture.detectChanges();
    tick();

    expect(component.loading).toBeFalse();
    currentUserSubject.next(mockUser); // restore
  }));

  // ── Review Modal ──────────────────────────────────────────────────────────

  it('should open review modal with empty state for new review', () => {
    component.enrolledCourses = [{ enrollment: mockEnrollments[0], course: mockCourse, myReview: null }];

    const fakeEvent = new MouseEvent('click');
    component.openReviewModal(1, fakeEvent);

    expect(component.showReviewModal).toBeTrue();
    expect(component.selectedCourseId).toBe(1);
    expect(component.reviewRating).toBe(0);
    expect(component.reviewComment).toBe('');
  });

  it('should open review modal pre-filled for existing review', () => {
    component.enrolledCourses = [{ enrollment: mockEnrollments[0], course: mockCourse, myReview: mockReview }];

    const fakeEvent = new MouseEvent('click');
    component.openReviewModal(1, fakeEvent);

    expect(component.showReviewModal).toBeTrue();
    expect(component.reviewRating).toBe(4);
    expect(component.reviewComment).toBe('Good course');
  });

  it('should close review modal and reset state', () => {
    component.showReviewModal = true;
    component.selectedCourseId = 1;
    component.reviewRating = 4;
    component.reviewComment = 'Test';

    component.closeReviewModal();

    expect(component.showReviewModal).toBeFalse();
    expect(component.selectedCourseId).toBeUndefined();
    expect(component.reviewRating).toBe(0);
    expect(component.reviewComment).toBe('');
  });

  // ── setRating ─────────────────────────────────────────────────────────────

  it('should set rating when star is clicked', () => {
    component.setRating(5);
    expect(component.reviewRating).toBe(5);
  });

  it('should update rating when different star is clicked', () => {
    component.setRating(3);
    expect(component.reviewRating).toBe(3);

    component.setRating(5);
    expect(component.reviewRating).toBe(5);
  });

  // ── submitReview ──────────────────────────────────────────────────────────

  it('should not submit when rating is 0', () => {
    component.currentUserId = 100;
    component.selectedCourseId = 1;
    component.reviewRating = 0;

    component.submitReview();

    expect(formationService.addOrUpdateReview).not.toHaveBeenCalled();
  });

  it('should submit review successfully', fakeAsync(() => {
    formationService.addOrUpdateReview.and.returnValue(of(mockReview));
    formationService.getCourseRatingStats.and.returnValue(of(mockRatingStats));
    formationService.getMyReview.and.returnValue(of(null));

    component.currentUserId = 100;
    component.selectedCourseId = 1;
    component.reviewRating = 5;
    component.reviewComment = 'Excellent!';
    component.showReviewModal = true;

    component.submitReview();
    tick();

    expect(formationService.addOrUpdateReview).toHaveBeenCalledWith(1, {
      userId: 100,
      rating: 5,
      comment: 'Excellent!'
    } as ReviewRequest);
    expect(toastService.success).toHaveBeenCalled();
    expect(component.showReviewModal).toBeFalse();
  }));

  it('should show error toast on review submission failure', fakeAsync(() => {
    formationService.addOrUpdateReview.and.returnValue(
      throwError({ status: 403, error: { message: 'Not enrolled' } })
    );

    component.currentUserId = 100;
    component.selectedCourseId = 1;
    component.reviewRating = 4;
    component.reviewComment = 'Test';

    component.submitReview();
    tick();

    expect(toastService.error).toHaveBeenCalled();
    expect(component.submittingReview).toBeFalse();
  }));

  it('should show inappropriate content error message', fakeAsync(() => {
    formationService.addOrUpdateReview.and.returnValue(
      throwError({ status: 400, error: { code: 'INAPPROPRIATE_CONTENT', message: 'Contenu inapproprié' } })
    );

    component.currentUserId = 100;
    component.selectedCourseId = 1;
    component.reviewRating = 3;
    component.reviewComment = 'Bad words here';

    component.submitReview();
    tick();

    expect(toastService.error).toHaveBeenCalledWith(
      jasmine.stringContaining('inappropriés')
    );
  }));

  // ── getStarsArray ─────────────────────────────────────────────────────────

  it('should return correct stars array for rating 4.6', () => {
    const stars = component.getStarsArray(4.6);
    // Math.round(4.6) = 5, so all 5 filled
    expect(stars).toEqual([true, true, true, true, true]);
  });

  it('should return correct stars array for rating 3.0', () => {
    const stars = component.getStarsArray(3.0);
    expect(stars).toEqual([true, true, true, false, false]);
  });

  it('should return correct stars array for rating 0', () => {
    const stars = component.getStarsArray(0);
    expect(stars).toEqual([false, false, false, false, false]);
  });

  // ── getStatusLabel ────────────────────────────────────────────────────────

  it('should return correct label for ACTIVE status', () => {
    expect(component.getStatusLabel('ACTIVE')).toBe('En cours');
  });

  it('should return correct label for COMPLETED status', () => {
    expect(component.getStatusLabel('COMPLETED')).toBe('Terminé');
  });

  it('should return correct label for CANCELLED status', () => {
    expect(component.getStatusLabel('CANCELLED')).toBe('Annulé');
  });

  it('should return status as-is for unknown status', () => {
    expect(component.getStatusLabel('UNKNOWN')).toBe('UNKNOWN');
  });

  // ── loadReviewStats ───────────────────────────────────────────────────────

  it('should load rating stats for each enrolled course', () => {
    component.currentUserId = 100;
    component.enrolledCourses = [{ enrollment: mockEnrollments[0], course: mockCourse }];

    component.loadReviewStats();

    expect(formationService.getCourseRatingStats).toHaveBeenCalledWith(1);
    expect(formationService.getMyReview).toHaveBeenCalledWith(1, 100);
  });

  it('should update ratingStats on enrolled course after loading', fakeAsync(() => {
    formationService.getCourseRatingStats.and.returnValue(of(mockRatingStats));
    formationService.getMyReview.and.returnValue(of(null));

    component.currentUserId = 100;
    component.enrolledCourses = [{ enrollment: mockEnrollments[0], course: mockCourse }];

    component.loadReviewStats();
    tick();

    expect(component.enrolledCourses[0].ratingStats).toEqual(mockRatingStats);
  }));

  it('should update myReview on enrolled course after loading', fakeAsync(() => {
    formationService.getCourseRatingStats.and.returnValue(of(mockRatingStats));
    formationService.getMyReview.and.returnValue(of(mockReview));

    component.currentUserId = 100;
    component.enrolledCourses = [{ enrollment: mockEnrollments[0], course: mockCourse }];

    component.loadReviewStats();
    tick();

    expect(component.enrolledCourses[0].myReview).toEqual(mockReview);
  }));
});
