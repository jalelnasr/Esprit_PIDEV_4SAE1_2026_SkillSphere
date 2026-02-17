import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CourseService, AuthService } from '@core/services';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  get currentUser$() {
    return this.authService.currentUser$;
  }

  stats = [
    { label: 'Courses Enrolled', value: 5, icon: '📚', color: '#667eea' },
    { label: 'In Progress', value: 3, icon: '🚀', color: '#764ba2' },
    { label: 'Completed', value: 8, icon: '✅', color: '#2ecc71' },
    { label: 'Total XP', value: 2450, icon: '⭐', color: '#f39c12' }
  ];

  recentCourses = [
    { id: 1, title: 'Advanced Angular Development', thumbnail: 'https://via.placeholder.com/300x200', progress: 45 },
    { id: 2, title: 'Python for Data Science', thumbnail: 'https://via.placeholder.com/300x200', progress: 80 },
    { id: 3, title: 'Web Design Masterclass', thumbnail: 'https://via.placeholder.com/300x200', progress: 25 }
  ];

  recommendations = [
    { title: 'React Advanced Patterns', category: 'Web Dev', level: 'Advanced' },
    { title: 'Machine Learning Basics', category: 'AI/ML', level: 'Beginner' },
    { title: 'Cloud Computing with AWS', category: 'Cloud', level: 'Intermediate' }
  ];

  constructor(private courseService: CourseService, private authService: AuthService, private location: Location) {}

  ngOnInit(): void {}

  goBack(): void {
    this.location.back();
  }
}
