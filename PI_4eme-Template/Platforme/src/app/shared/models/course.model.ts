export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  level: CourseLevel;
  duration: number; // in hours
  price: number;
  rating: number;
  reviewCount: number;
  enrolledCount: number;
  instructorId: string;
  instructorName: string;
  prerequisites?: string[];
  learningOutcomes: string[];
  createdAt: Date;
  updatedAt: Date;
}

export enum CourseLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT'
}

export interface CourseDetail extends Course {
  content: CourseSection[];
  reviews: CourseReview[];
}

export interface CourseSection {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: number;
  type: 'VIDEO' | 'DOCUMENT' | 'QUIZ' | 'ASSIGNMENT';
  contentUrl?: string;
  order: number;
}

export interface CourseReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: Date;
  progress: number;
  completed: boolean;
  completedAt?: Date;
}

export interface CourseProgress {
  userId: string;
  courseId: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  completedAt?: Date;
}
