import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Course,
  CourseRequest,
  Session,
  SessionRequest,
  Enrollment,
  EnrollmentRequest,
  Lesson,
  LessonRequest,
  LessonProgress,
  LearningPath,
  LearningPathRequest,
  LearningPathRoadmap,
  CourseStatus
} from '../../shared/models/formation.model';

export interface CourseRatingStats {
  courseId: number;
  averageRating: number;
  totalReviews: number;
}

export interface CourseReview {
  id: number;
  courseId: number;
  userId: number;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ReviewRequest {
  userId: number;
  rating: number;
  comment: string;
}

@Injectable({
  providedIn: 'root'
})
export class FormationService {
  private readonly baseUrl = environment.formationApi || `${environment.apiUrl}/formation-service/api`;

  constructor(private http: HttpClient) {}

  // ============ Courses ============
  getCourses(status?: CourseStatus): Observable<Course[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<Course[]>(`${this.baseUrl}/courses`, { params });
  }

  getCourseById(id: number): Observable<Course> {
    return this.http.get<Course>(`${this.baseUrl}/courses/${id}`);
  }

  createCourse(request: CourseRequest): Observable<Course> {
    return this.http.post<Course>(`${this.baseUrl}/courses`, request);
  }

  updateCourse(id: number, request: CourseRequest): Observable<Course> {
    return this.http.put<Course>(`${this.baseUrl}/courses/${id}`, request);
  }

  publishCourse(id: number): Observable<Course> {
    return this.http.post<Course>(`${this.baseUrl}/courses/${id}/publish`, {});
  }

  unpublishCourse(id: number): Observable<Course> {
    return this.http.post<Course>(`${this.baseUrl}/courses/${id}/unpublish`, {});
  }

  deleteCourse(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/courses/${id}`);
  }

  // ============ Sessions ============
  getCourseSessions(courseId: number): Observable<Session[]> {
    return this.http.get<Session[]>(`${this.baseUrl}/courses/${courseId}/sessions`);
  }

  getAllSessions(): Observable<Session[]> {
    return this.http.get<Session[]>(`${this.baseUrl}/sessions`);
  }

  getRecentSessions(limit: number = 10): Observable<Session[]> {
    return this.http.get<Session[]>(`${this.baseUrl}/sessions/recent`, {
      params: { limit: limit.toString() }
    });
  }

  createSession(courseId: number, request: SessionRequest): Observable<Session> {
    return this.http.post<Session>(`${this.baseUrl}/courses/${courseId}/sessions`, request);
  }

  updateSession(sessionId: number, request: SessionRequest): Observable<Session> {
    return this.http.put<Session>(`${this.baseUrl}/sessions/${sessionId}`, request);
  }

  openSession(sessionId: number): Observable<Session> {
    return this.http.post<Session>(`${this.baseUrl}/sessions/${sessionId}/open`, {});
  }

  closeSession(sessionId: number): Observable<Session> {
    return this.http.post<Session>(`${this.baseUrl}/sessions/${sessionId}/close`, {});
  }

  enrollInSession(sessionId: number, userId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/sessions/${sessionId}/enroll`, { userId });
  }

  deleteSession(sessionId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/sessions/${sessionId}`);
  }

  // ============ Enrollments ============
  enrollInCourse(courseId: number, userId: number): Observable<Enrollment> {
    return this.http.post<Enrollment>(`${this.baseUrl}/courses/${courseId}/enroll`, { userId });
  }

  cancelEnrollment(enrollmentId: number): Observable<Enrollment> {
    return this.http.post<Enrollment>(`${this.baseUrl}/enrollments/${enrollmentId}/cancel`, {});
  }

  getUserEnrollments(userId: number): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(`${this.baseUrl}/users/${userId}/enrollments`);
  }

  // ============ Enrollment Status Checking ============
  checkCourseEnrollment(userId: number, courseId: number): Observable<{isEnrolled: boolean}> {
    return this.http.get<{isEnrolled: boolean}>(
      `${this.baseUrl}/users/${userId}/courses/${courseId}/enrollment-status`
    );
  }

  checkSessionEnrollment(userId: number, sessionId: number): Observable<{isEnrolled: boolean}> {
    return this.http.get<{isEnrolled: boolean}>(
      `${this.baseUrl}/users/${userId}/sessions/${sessionId}/enrollment-status`
    );
  }

  getUserEnrolledSessionIds(userId: number): Observable<number[]> {
    return this.http.get<number[]>(`${this.baseUrl}/users/${userId}/enrolled-session-ids`);
  }

  // ============ Lessons ============
  getCourseLessons(courseId: number): Observable<Lesson[]> {
    return this.http.get<Lesson[]>(`${this.baseUrl}/courses/${courseId}/lessons`);
  }

  createLesson(courseId: number, request: LessonRequest): Observable<Lesson> {
    return this.http.post<Lesson>(`${this.baseUrl}/courses/${courseId}/lessons`, request);
  }

  // ============ Progress ============
  getLessonProgress(enrollmentId: number, lessonId: number): Observable<LessonProgress> {
    return this.http.get<LessonProgress>(`${this.baseUrl}/enrollments/${enrollmentId}/lessons/${lessonId}/progress`);
  }

  markLessonComplete(enrollmentId: number, lessonId: number): Observable<LessonProgress> {
    return this.http.post<LessonProgress>(`${this.baseUrl}/enrollments/${enrollmentId}/lessons/${lessonId}/complete`, {});
  }

  // ============ Learning Paths ============
  getLearningPaths(): Observable<LearningPath[]> {
    return this.http.get<LearningPath[]>(`${this.baseUrl}/learning-paths`);
  }

  getLearningPathRoadmap(id: number): Observable<LearningPathRoadmap> {
    return this.http.get<LearningPathRoadmap>(`${this.baseUrl}/learning-paths/${id}/roadmap`);
  }

  createLearningPath(request: LearningPathRequest): Observable<LearningPath> {
    return this.http.post<LearningPath>(`${this.baseUrl}/learning-paths`, request);
  }

  addCourseToPath(pathId: number, courseId: number, orderIndex: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/learning-paths/${pathId}/courses`, { courseId, orderIndex });
  }

  // ============ Reviews (Simple) ============
  addOrUpdateReview(courseId: number, request: ReviewRequest): Observable<CourseReview> {
    return this.http.post<CourseReview>(`${this.baseUrl}/courses/${courseId}/reviews`, request);
  }

  getCourseRatingStats(courseId: number): Observable<CourseRatingStats> {
    return this.http.get<CourseRatingStats>(`${this.baseUrl}/courses/${courseId}/reviews/stats`);
  }

  getMyReview(courseId: number, userId: number): Observable<CourseReview | null> {
    return this.http.get<CourseReview>(`${this.baseUrl}/courses/${courseId}/reviews/my-review`, {
      params: { userId: userId.toString() }
    });
  }

  getAllReviews(courseId: number): Observable<CourseReview[]> {
    return this.http.get<CourseReview[]>(`${this.baseUrl}/courses/${courseId}/reviews`);
  }

  // ============ Instructor Methods ============
  getInstructorSessions(instructorId: number): Observable<Session[]> {
    return this.http.get<Session[]>(`${this.baseUrl}/instructors/${instructorId}/sessions`);
  }

  getInstructorCourses(instructorId: number): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.baseUrl}/instructors/${instructorId}/courses`);
  }

  // ============ Instructor Statistics ============
  getInstructorStatistics(instructorId: number): Observable<InstructorStatistics> {
    return this.http.get<InstructorStatistics>(`${this.baseUrl}/instructors/${instructorId}/statistics`);
  }

  // ============ Student Tracking ============
  getInstructorStudents(instructorId: number): Observable<StudentProgress[]> {
    return this.http.get<StudentProgress[]>(`${this.baseUrl}/instructors/${instructorId}/students`);
  }

  getStudentsByFormation(courseId: number): Observable<StudentProgress[]> {
    return this.http.get<StudentProgress[]>(`${this.baseUrl}/courses/${courseId}/students`);
  }

  getStudentProgress(enrollmentId: number): Observable<StudentProgress> {
    return this.http.get<StudentProgress>(`${this.baseUrl}/enrollments/${enrollmentId}/progress`);
  }

  exportStudentList(instructorId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/instructors/${instructorId}/students/export`, {
      responseType: 'blob'
    });
  }

  // ============ Lesson Progress Tracking ============
  
  /**
   * Mark a lesson as completed (automatically when student opens it)
   */
  markLessonCompleted(enrollmentId: number, lessonId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/lesson-progress/complete`, null, {
      params: { enrollmentId: enrollmentId.toString(), lessonId: lessonId.toString() }
    });
  }

  /**
   * Track lesson access (update last accessed time)
   */
  trackLessonAccess(enrollmentId: number, lessonId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/lesson-progress/access`, null, {
      params: { enrollmentId: enrollmentId.toString(), lessonId: lessonId.toString() }
    });
  }
}

// ============ New Interfaces for Statistics ============
export interface InstructorStatistics {
  totalFormations: number;
  totalSessions: number;
  totalStudents: number;
  averageCompletionRate: number;
  enrollmentTrends: EnrollmentTrend[];
  topFormations: TopFormation[];
  recentActivities: RecentActivity[];
}

export interface EnrollmentTrend {
  month: string;
  enrollmentCount: number;
}

export interface TopFormation {
  courseId: number;
  courseTitle: string;
  enrollmentCount: number;
  completionRate: number;
}

export interface RecentActivity {
  type: string;
  description: string;
  timestamp: string;
  relatedCourseId: number;
  relatedCourseTitle: string;
}

export interface StudentProgress {
  enrollmentId: number;
  userId: number;
  userName: string;
  userEmail: string;
  courseId: number;
  courseTitle: string;
  completionPercent: number;
  status: string;
  enrolledAt: string;
  lastActivity: string;
  completedAt?: string;
  totalLessons: number;
  completedLessons: number;
  timeSpentMinutes: number;
}

export interface CourseRatingStats {
  courseId: number;
  averageRating: number;
  totalReviews: number;
}

export interface CourseReview {
  id: number;
  courseId: number;
  userId: number;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ReviewRequest {
  userId: number;
  rating: number;
  comment: string;
}
