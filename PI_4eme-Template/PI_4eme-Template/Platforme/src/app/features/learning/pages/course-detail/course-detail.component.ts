import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '@core/services';
import { Observable } from 'rxjs';
import { CourseDetail } from '@shared/models';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './course-detail.component.html',
  styleUrls: ['./course-detail.component.css']
})
export class CourseDetailComponent implements OnInit {
  courseId!: string;
  course$!: Observable<CourseDetail>;
  isEnrolled = false;
  activeTab: 'overview' | 'curriculum' | 'reviews' = 'overview';

  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('id') || '';
    if (this.courseId) {
      this.course$ = this.courseService.getCourseById(this.courseId);
    }
  }

  enroll(): void {
    this.courseService.enrollCourse(this.courseId, 'currentUserId').subscribe({
      next: () => {
        this.isEnrolled = true;
        this.router.navigate(['/learning/my-courses']);
      }
    });
  }

  startLearning(): void {
    this.router.navigate(['/learning/learning', this.courseId]);
  }

  goBack(): void {
    this.location.back();
  }
}
