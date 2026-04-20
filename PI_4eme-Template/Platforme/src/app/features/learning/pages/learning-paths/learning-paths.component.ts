import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormationService } from '@core/services/formation.service';
import { LearningPath } from '@shared/models/formation.model';

@Component({
  selector: 'app-learning-paths',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './learning-paths.component.html',
  styleUrls: ['./learning-paths.component.css']
})
export class LearningPathsComponent implements OnInit {
  learningPaths: LearningPath[] = [];
  loading = false;

  constructor(private formationService: FormationService) {}

  ngOnInit(): void {
    this.loadLearningPaths();
  }

  loadLearningPaths(): void {
    this.loading = true;
    this.formationService.getLearningPaths().subscribe({
      next: (paths) => {
        this.learningPaths = paths;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading paths:', err);
        this.loading = false;
      }
    });
  }
}
