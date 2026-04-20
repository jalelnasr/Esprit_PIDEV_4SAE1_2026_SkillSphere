import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-learning-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './learning-player.component.html',
  styleUrls: ['./learning-player.component.css']
})
export class LearningPlayerComponent implements OnInit {
  courseId!: string;
  currentLessonIndex = 0;
  isPlaying = false;

  lessons = [
    { id: 1, title: 'Welcome to the course', type: 'VIDEO', duration: 5 },
    { id: 2, title: 'Course Overview', type: 'VIDEO', duration: 10 },
    { id: 3, title: 'Setup Your Environment', type: 'VIDEO', duration: 15 },
    { id: 4, title: 'First Project Assignment', type: 'ASSIGNMENT', duration: 60 },
    { id: 5, title: 'Quiz: Section 1', type: 'QUIZ', duration: 20 }
  ];

  constructor(private route: ActivatedRoute, private location: Location) {}

  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('courseId') || '';
  }

  get currentLesson() {
    return this.lessons[this.currentLessonIndex];
  }

  nextLesson(): void {
    if (this.currentLessonIndex < this.lessons.length - 1) {
      this.currentLessonIndex++;
    }
  }

  previousLesson(): void {
    if (this.currentLessonIndex > 0) {
      this.currentLessonIndex--;
    }
  }

  selectLesson(index: number): void {
    this.currentLessonIndex = index;
  }

  togglePlayPause(): void {
    this.isPlaying = !this.isPlaying;
  }

  completeLesson(): void {
    console.log('Lesson marked as complete');
    this.nextLesson();
  }

  goBack(): void {
    this.location.back();
  }
}
