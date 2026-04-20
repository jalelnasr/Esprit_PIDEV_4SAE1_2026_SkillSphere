import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { 
  Course as OldCourse, 
  CourseDetail as OldCourseDetail, 
  Enrollment as OldEnrollment, 
  CourseProgress as OldCourseProgress, 
  CourseLevel as OldCourseLevel 
} from '@shared/models/course-old.model';
import { PaginatedResponse } from '@shared/models';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private mockCourses: OldCourse[] = [
    {
      id: '1',
      title: 'Advanced Angular Development',
      description: 'Master Angular with modern patterns and best practices',
      thumbnail: '', // No external URL - CSS gradient fallback
      category: 'Web Development',
      level: OldCourseLevel.ADVANCED,
      duration: 40,
      price: 99.99,
      rating: 4.8,
      reviewCount: 245,
      enrolledCount: 1200,
      instructorId: '101',
      instructorName: 'John Smith',
      learningOutcomes: ['Master Angular architecture', 'Build scalable applications'],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      title: 'Python for Data Science',
      description: 'Learn data analysis and machine learning with Python',
      thumbnail: '', // No external URL - CSS gradient fallback
      category: 'Data Science',
      level: OldCourseLevel.INTERMEDIATE,
      duration: 35,
      price: 79.99,
      rating: 4.7,
      reviewCount: 189,
      enrolledCount: 980,
      instructorId: '102',
      instructorName: 'Jane Doe',
      learningOutcomes: ['Data analysis with pandas', 'ML with scikit-learn'],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      title: 'Full Stack Web Development',
      description: 'Complete guide from frontend to backend development',
      thumbnail: '', // No external URL - CSS gradient fallback
      category: 'Web Development',
      level: OldCourseLevel.BEGINNER,
      duration: 60,
      price: 129.99,
      rating: 4.9,
      reviewCount: 512,
      enrolledCount: 2500,
      instructorId: '103',
      instructorName: 'Mike Johnson',
      learningOutcomes: ['HTML/CSS/JavaScript', 'React/Node.js', 'Database design'],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  constructor() {}

  getCourses(page: number = 1, pageSize: number = 12): Observable<PaginatedResponse<OldCourse>> {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedCourses = this.mockCourses.slice(start, end);

    return of({
      data: paginatedCourses,
      totalItems: this.mockCourses.length,
      totalPages: Math.ceil(this.mockCourses.length / pageSize),
      currentPage: page,
      pageSize: pageSize
    });
  }

  getCourseById(id: string): Observable<OldCourseDetail> {
    const course = this.mockCourses.find(c => c.id === id);
    if (!course) {
      return of({} as OldCourseDetail);
    }

    const courseDetail: OldCourseDetail = {
      ...course,
      content: [
        {
          id: 's1',
          title: 'Introduction',
          description: 'Get started with the basics',
          order: 1,
          lessons: [
            { id: 'l1', title: 'Welcome', description: 'Welcome to the course', duration: 5, type: 'VIDEO', order: 1 },
            { id: 'l2', title: 'Course Overview', description: 'What you will learn', duration: 10, type: 'VIDEO', order: 2 }
          ]
        }
      ],
      reviews: []
    };

    return of(courseDetail);
  }

  enrollCourse(courseId: string, userId: string): Observable<OldEnrollment> {
    const enrollment: OldEnrollment = {
      id: Date.now().toString(),
      userId,
      courseId,
      enrolledAt: new Date(),
      progress: 0,
      completed: false
    };

    return of(enrollment);
  }

  getCourseProgress(courseId: string, userId: string): Observable<OldCourseProgress> {
    return of({
      userId,
      courseId,
      progress: 45,
      completedLessons: 9,
      totalLessons: 20
    });
  }

  getSearchSuggestions(query: string): Observable<OldCourse[]> {
    const filtered = this.mockCourses.filter(c => 
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase())
    );
    return of(filtered.slice(0, 5));
  }
}
