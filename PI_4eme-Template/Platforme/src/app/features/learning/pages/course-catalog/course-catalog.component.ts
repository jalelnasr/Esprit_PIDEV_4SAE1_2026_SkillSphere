import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';import { Location } from '@angular/common';import { RouterLink } from '@angular/router';
import { CourseService } from '@core/services';
import { CourseCardComponent } from '@shared/components';
import { Observable } from 'rxjs';
import { PaginatedResponse } from '@shared/models';
import { Course } from '@shared/models';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-course-catalog',
  standalone: true,
  imports: [CommonModule, CourseCardComponent, FormsModule, RouterLink],
  templateUrl: './course-catalog.component.html',
  styleUrls: ['./course-catalog.component.css']
})
export class CourseCatalogComponent implements OnInit {
  courses$!: Observable<PaginatedResponse<Course>>;
  selectedCategory = 'All';
  selectedLevel = 'All';
  priceRange = [0, 200];
  searchQuery = '';

  categories = ['All', 'Web Development', 'Data Science', 'Mobile Development', 'AI & ML', 'Business', 'Design'];
  levels = ['All', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];

  currentPage = 1;
  pageSize = 12;

  constructor(private courseService: CourseService, private location: Location) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.courses$ = this.courseService.getCourses(this.currentPage, this.pageSize);
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.currentPage = 1;
    this.loadCourses();
  }

  onLevelChange(level: string): void {
    this.selectedLevel = level;
    this.currentPage = 1;
    this.loadCourses();
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadCourses();
  }

  goBack(): void {
    this.location.back();
  }
}
