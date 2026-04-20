import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';

@Component({
  selector: 'app-my-courses',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-courses.component.html',
  styleUrls: ['./my-courses.component.css']
})
export class MyCoursesComponent {
  constructor(private location: Location) {}
  enrolledCourses = [
    {
      id: '1',
      title: 'Advanced Angular Development',
      thumbnail: 'https://via.placeholder.com/300x200?text=Angular',
      progress: 45,
      lastAccessed: '2 days ago',
      duration: 40,
      completedLessons: 18,
      totalLessons: 40
    },
    {
      id: '2',
      title: 'Python for Data Science',
      thumbnail: 'https://via.placeholder.com/300x200?text=Python',
      progress: 80,
      lastAccessed: '1 day ago',
      duration: 35,
      completedLessons: 28,
      totalLessons: 35
    }
  ];

  completedCourses = [
    {
      id: '3',
      title: 'JavaScript Fundamentals',
      thumbnail: 'https://via.placeholder.com/300x200?text=JavaScript',
      certificate: true,
      rating: 4.8
    }
  ];

  continueLearning(courseId: string): void {
    console.log('Continue learning:', courseId);
  }

  goBack(): void {
    this.location.back();
  }
}
