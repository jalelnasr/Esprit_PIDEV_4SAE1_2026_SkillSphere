import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Course {
  id: string;
  title: string;
  thumbnail: string;
  level: string;
  category: string;
  price: number;
  rating: number;
  reviewCount: number;
  instructorName: string;
  enrolledCount: number;
  duration: number;
}

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './course-card.component.html',
  styleUrls: ['./course-card.component.css']
})
export class CourseCardComponent {
  @Input() course!: Course;
  @Output() enroll = new EventEmitter<string>();
  
  isFavorite = false;
  
  toggleFavorite() {
    this.isFavorite = !this.isFavorite;
  }
  
  onEnroll() {
    this.enroll.emit(this.course.id);
  }
}
