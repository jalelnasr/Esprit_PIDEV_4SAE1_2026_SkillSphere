import {Component, OnInit} from '@angular/core';
import { EvaluationApiService, Evaluation } from '../../../services/evaluation-api.service';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
@Component({
  selector: 'app-evaluation-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './evaluation-list.component.html',
  styleUrl: './evaluation-list.component.css'
})



export class EvaluationListComponent implements OnInit {

  evaluations: Evaluation[] = [];
  loading = true;
  error: string | null = null;

  // TEMPORARY (until login exists)
  formateurId = 1;

  constructor(private evaluationService: EvaluationApiService) {}

  ngOnInit(): void {
    this.loadEvaluations();
  }

  loadEvaluations(): void {
    this.evaluationService.getByFormateur(this.formateurId)
      .subscribe({
        next: (data) => {
          this.evaluations = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load evaluations';
          this.loading = false;
          console.error(err);
        }
      });
  }

}
