// Models correspondant aux entités backend Formation Service

export enum CourseLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED'
}

export enum CourseStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

export enum AccessLevel {
  BASIC = 'BASIC',
  PLUS = 'PLUS',
  PREMIUM = 'PREMIUM'
}

export enum SessionStatus {
  PLANNED = 'PLANNED',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  CANCELED = 'CANCELED'
}

export enum EnrollmentStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}

export enum ResourceType {
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
  QUIZ = 'QUIZ',
  EXERCISE = 'EXERCISE'
}

// ============ Course (Formation) ============
export interface Course {
  id: number;
  title: string;
  description: string;
  level: CourseLevel;
  accessLevel: AccessLevel;
  language: string;
  durationMinutes: number;
  thumbnailUrl?: string;
  status: CourseStatus;
  createdAt: string;
  createdBy: number;
}

export interface CourseRequest {
  title: string;
  description: string;
  level: CourseLevel;
  accessLevel: AccessLevel;
  language: string;
  durationMinutes: number;
  thumbnailUrl?: string;
  createdBy: number;
  status?: CourseStatus;
}

// ============ Session ============
export interface Session {
  id: number;
  courseId: number;
  startAt: string;
  endAt: string;
  timezone: string;
  capacity: number;
  enrolledCount: number;
  status: SessionStatus;
}

export interface SessionRequest {
  startAt: string;
  endAt: string;
  timezone: string;
  location?: string;
  capacity: number;
}

// ============ Enrollment (Inscription) ============
export interface Enrollment {
  id: number;
  userId: number;
  courseId: number;
  courseTitle: string;
  inscriptionDate: string;
  status: EnrollmentStatus;
  completionPercent: number;
  completedAt?: string;
}

export interface EnrollmentRequest {
  userId: number;
}

// ============ Lesson (Module/Chapitre) ============
export interface Lesson {
  id: number;
  title: string;
  orderIndex: number;
  durationMinutes: number;
  courseId: number;
  resources?: LessonResource[];
}

export interface LessonResource {
  id: number;
  lessonId: number;
  title: string;
  type: ResourceType;
  url: string;
  orderIndex: number;
}

export interface LessonRequest {
  title: string;
  orderIndex: number;
  durationMinutes: number;
}

// ============ Progress ============
export interface LessonProgress {
  id: number;
  enrollmentId: number;
  lessonId: number;
  completed: boolean;
  completedAt?: string;
}

// ============ Learning Path (Parcours) ============
export interface LearningPath {
  id: number;
  title: string;
  description: string;
  createdBy: number;
  createdAt: string;
  items?: LearningPathItem[];
}

export interface LearningPathItem {
  id: number;
  learningPathId: number;
  courseId: number;
  orderIndex: number;
  course?: Course;
}

export interface LearningPathRequest {
  title: string;
  description: string;
}

export interface LearningPathRoadmap {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  items: LearningPathItemWithCourse[];
}

export interface LearningPathItemWithCourse {
  orderIndex: number;
  course: Course;
}

// ============ Session Enrollment ============
export interface SessionEnrollment {
  id: number;
  sessionId: number;
  userId: number;
  userName: string;
  userEmail: string;
  enrolledAt: string;
  status: string;
}
