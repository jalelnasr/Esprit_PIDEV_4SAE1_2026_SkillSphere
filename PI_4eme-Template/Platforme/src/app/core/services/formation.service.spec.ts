import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormationService, CourseRatingStats, CourseReview, ReviewRequest } from './formation.service';
import { Course, Enrollment, EnrollmentStatus, CourseLevel, CourseStatus, AccessLevel, Session, SessionStatus } from '../../shared/models/formation.model';

describe('FormationService', () => {
  let service: FormationService;
  let httpMock: HttpTestingController;
  const base = 'http://localhost:8087/formation-service/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FormationService]
    });
    service = TestBed.inject(FormationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── Courses ───────────────────────────────────────────────────────────────

  it('should get all courses', () => {
    const mockCourses: Course[] = [
      { id: 1, title: 'Java Basics', description: 'Learn Java', level: CourseLevel.BEGINNER,
        language: 'French', status: CourseStatus.PUBLISHED, createdBy: 1,
        accessLevel: AccessLevel.BASIC, durationMinutes: 120, createdAt: '' },
      { id: 2, title: 'Advanced Java', description: 'Master Java', level: CourseLevel.ADVANCED,
        language: 'French', status: CourseStatus.PUBLISHED, createdBy: 1,
        accessLevel: AccessLevel.PREMIUM, durationMinutes: 240, createdAt: '' }
    ];

    service.getCourses().subscribe(courses => {
      expect(courses.length).toBe(2);
      expect(courses[0].title).toBe('Java Basics');
    });

    const req = httpMock.expectOne(`${base}/courses`);
    expect(req.request.method).toBe('GET');
    req.flush(mockCourses);
  });

  it('should get course by id', () => {
    const mockCourse: Course = {
      id: 1, title: 'Java Basics', description: 'Learn Java',
      level: CourseLevel.BEGINNER, language: 'French', status: CourseStatus.PUBLISHED,
      createdBy: 1, accessLevel: AccessLevel.BASIC, durationMinutes: 120, createdAt: ''
    };

    service.getCourseById(1).subscribe(course => {
      expect(course.id).toBe(1);
      expect(course.title).toBe('Java Basics');
    });

    const req = httpMock.expectOne(`${base}/courses/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockCourse);
  });

  it('should create course', () => {
    const request = { title: 'New Course', description: 'Desc', level: CourseLevel.BEGINNER,
      language: 'French', durationMinutes: 60, createdBy: 1 };
    const created: Course = { ...request, id: 1, status: CourseStatus.DRAFT,
      accessLevel: AccessLevel.BASIC, createdAt: '' };

    service.createCourse(request).subscribe(course => {
      expect(course.id).toBe(1);
      expect(course.title).toBe('New Course');
    });

    const req = httpMock.expectOne(`${base}/courses`);
    expect(req.request.method).toBe('POST');
    req.flush(created);
  });

  it('should update course', () => {
    const request = { title: 'Updated', description: 'Desc', level: CourseLevel.INTERMEDIATE,
      language: 'French', durationMinutes: 90, createdBy: 1 };
    const updated: Course = { ...request, id: 1, status: CourseStatus.PUBLISHED,
      accessLevel: AccessLevel.PLUS, createdAt: '' };

    service.updateCourse(1, request).subscribe(course => {
      expect(course.title).toBe('Updated');
    });

    const req = httpMock.expectOne(`${base}/courses/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(updated);
  });

  it('should delete course', () => {
    service.deleteCourse(1).subscribe(res => expect(res).toBeNull());

    const req = httpMock.expectOne(`${base}/courses/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should publish course', () => {
    const published: Course = { id: 1, title: 'Course', description: '', level: CourseLevel.BEGINNER,
      language: 'French', status: CourseStatus.PUBLISHED, createdBy: 1,
      accessLevel: AccessLevel.BASIC, durationMinutes: 60, createdAt: '' };

    service.publishCourse(1).subscribe(course => {
      expect(course.status).toBe(CourseStatus.PUBLISHED);
    });

    const req = httpMock.expectOne(`${base}/courses/1/publish`);
    expect(req.request.method).toBe('POST');
    req.flush(published);
  });

  // ── Enrollments ───────────────────────────────────────────────────────────

  it('should enroll user in course', () => {
    const mockEnrollment: Enrollment = {
      id: 1, userId: 100, courseId: 1, courseTitle: 'Java Basics',
      inscriptionDate: new Date().toISOString(),
      status: EnrollmentStatus.ACTIVE, completionPercent: 0
    };

    service.enrollInCourse(1, 100).subscribe(enrollment => {
      expect(enrollment.userId).toBe(100);
      expect(enrollment.status).toBe(EnrollmentStatus.ACTIVE);
    });

    const req = httpMock.expectOne(`${base}/courses/1/enroll`);
    expect(req.request.method).toBe('POST');
    req.flush(mockEnrollment);
  });

  it('should get user enrollments', () => {
    const mockEnrollments: Enrollment[] = [
      { id: 1, userId: 100, courseId: 1, courseTitle: 'Java', inscriptionDate: '',
        status: EnrollmentStatus.ACTIVE, completionPercent: 50 },
      { id: 2, userId: 100, courseId: 2, courseTitle: 'Python', inscriptionDate: '',
        status: EnrollmentStatus.COMPLETED, completionPercent: 100 }
    ];

    service.getUserEnrollments(100).subscribe(enrollments => {
      expect(enrollments.length).toBe(2);
      expect(enrollments[0].userId).toBe(100);
    });

    const req = httpMock.expectOne(`${base}/users/100/enrollments`);
    expect(req.request.method).toBe('GET');
    req.flush(mockEnrollments);
  });

  it('should check course enrollment status', () => {
    service.checkCourseEnrollment(100, 1).subscribe(result => {
      expect(result.isEnrolled).toBeTrue();
    });

    const req = httpMock.expectOne(`${base}/users/100/courses/1/enrollment-status`);
    expect(req.request.method).toBe('GET');
    req.flush({ isEnrolled: true });
  });

  it('should cancel enrollment', () => {
    const cancelled: Enrollment = {
      id: 1, userId: 100, courseId: 1, courseTitle: 'Java', inscriptionDate: '',
      status: EnrollmentStatus.CANCELLED, completionPercent: 30
    };

    service.cancelEnrollment(1).subscribe(enrollment => {
      expect(enrollment.status).toBe(EnrollmentStatus.CANCELLED);
    });

    const req = httpMock.expectOne(`${base}/enrollments/1/cancel`);
    expect(req.request.method).toBe('POST');
    req.flush(cancelled);
  });

  // ── Sessions ──────────────────────────────────────────────────────────────

  it('should get sessions by course', () => {
    const mockSessions: Session[] = [
      { id: 1, courseId: 1, startAt: '', endAt: '', timezone: 'UTC',
        capacity: 30, enrolledCount: 15, status: SessionStatus.PLANNED }
    ];

    service.getCourseSessions(1).subscribe(sessions => {
      expect(sessions.length).toBe(1);
    });

    const req = httpMock.expectOne(`${base}/courses/1/sessions`);
    expect(req.request.method).toBe('GET');
    req.flush(mockSessions);
  });

  it('should create session', () => {
    const request = { startAt: '', endAt: '', timezone: 'UTC', capacity: 25 };
    const created: Session = { id: 1, courseId: 1, ...request, enrolledCount: 0, status: SessionStatus.PLANNED };

    service.createSession(1, request).subscribe(session => {
      expect(session.id).toBe(1);
      expect(session.capacity).toBe(25);
    });

    const req = httpMock.expectOne(`${base}/courses/1/sessions`);
    expect(req.request.method).toBe('POST');
    req.flush(created);
  });

  // ── Reviews ───────────────────────────────────────────────────────────────

  it('should add or update review', () => {
    const reviewRequest: ReviewRequest = { userId: 100, rating: 5, comment: 'Excellent!' };
    const mockReview: CourseReview = {
      id: 1, courseId: 1, userId: 100, rating: 5,
      comment: 'Excellent!', createdAt: new Date().toISOString()
    };

    service.addOrUpdateReview(1, reviewRequest).subscribe(review => {
      expect(review.rating).toBe(5);
      expect(review.comment).toBe('Excellent!');
    });

    const req = httpMock.expectOne(`${base}/courses/1/reviews`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(reviewRequest);
    req.flush(mockReview);
  });

  it('should get course rating stats', () => {
    const mockStats: CourseRatingStats = { courseId: 1, averageRating: 4.6, totalReviews: 120 };

    service.getCourseRatingStats(1).subscribe(stats => {
      expect(stats.averageRating).toBe(4.6);
      expect(stats.totalReviews).toBe(120);
    });

    const req = httpMock.expectOne(`${base}/courses/1/reviews/stats`);
    expect(req.request.method).toBe('GET');
    req.flush(mockStats);
  });

  it('should get user review', () => {
    const mockReview: CourseReview = {
      id: 1, courseId: 1, userId: 100, rating: 4,
      comment: 'Good course', createdAt: new Date().toISOString()
    };

    service.getMyReview(1, 100).subscribe(review => {
      if (review) {
        expect(review.rating).toBe(4);
        expect(review.userId).toBe(100);
      }
    });

    const req = httpMock.expectOne(`${base}/courses/1/reviews/my-review?userId=100`);
    expect(req.request.method).toBe('GET');
    req.flush(mockReview);
  });

  it('should handle review not found (null)', () => {
    service.getMyReview(1, 100).subscribe(review => {
      expect(review).toBeNull();
    });

    const req = httpMock.expectOne(`${base}/courses/1/reviews/my-review?userId=100`);
    req.flush(null);
  });

  it('should get all reviews for a course', () => {
    const mockReviews: CourseReview[] = [
      { id: 1, courseId: 1, userId: 100, rating: 5, comment: 'Great!', createdAt: '' },
      { id: 2, courseId: 1, userId: 101, rating: 4, comment: 'Good', createdAt: '' }
    ];

    service.getAllReviews(1).subscribe(reviews => {
      expect(reviews.length).toBe(2);
    });

    const req = httpMock.expectOne(`${base}/courses/1/reviews`);
    expect(req.request.method).toBe('GET');
    req.flush(mockReviews);
  });

  // ── Error Handling ────────────────────────────────────────────────────────

  it('should handle 500 error when getting courses', () => {
    service.getCourses().subscribe({
      next: () => fail('should have failed'),
      error: (error) => expect(error.status).toBe(500)
    });

    const req = httpMock.expectOne(`${base}/courses`);
    req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
  });

  it('should handle 404 when course not found', () => {
    service.getCourseById(999).subscribe({
      next: () => fail('should have failed'),
      error: (error) => expect(error.status).toBe(404)
    });

    const req = httpMock.expectOne(`${base}/courses/999`);
    req.flush('Not found', { status: 404, statusText: 'Not Found' });
  });

  it('should handle 403 when enrolling without subscription', () => {
    service.enrollInCourse(1, 100).subscribe({
      next: () => fail('should have failed'),
      error: (error) => expect(error.status).toBe(403)
    });

    const req = httpMock.expectOne(`${base}/courses/1/enroll`);
    req.flush('Access denied', { status: 403, statusText: 'Forbidden' });
  });
});
