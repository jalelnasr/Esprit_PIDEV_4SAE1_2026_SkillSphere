import {Component, OnInit} from '@angular/core';
import { EvaluationApiService, Evaluation } from '../../../services/evaluation-api.service';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { BackendUser } from '../../../core/models/auth.model';
import { filter, take } from 'rxjs/operators';
@Component({
  selector: 'app-evaluation-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './evaluation-list.component.html',
  styleUrl: './evaluation-list.component.css'
})



export class EvaluationListComponent implements OnInit {

  evaluations: Evaluation[] = [];
  loading = true;
  error: string | null = null;
  searchTerm = '';
  private formateurId: number | null = null;

  constructor(
    private evaluationService: EvaluationApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(filter((user): user is BackendUser => !!user), take(1))
      .subscribe((user) => {
        this.formateurId = user.idUser;
        this.loadEvaluations(user.idUser);
      });
  }

  loadEvaluations(formateurId: number): void {
    this.evaluationService.getByFormateur(formateurId)
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

  onSearch(): void {
    const term = this.searchTerm.trim();
    if (!this.formateurId) {
      return;
    }

    this.loading = true;
    this.error = null;

    if (!term) {
      this.loadEvaluations(this.formateurId);
      return;
    }

    this.evaluationService.searchEvaluations(this.formateurId, term)
      .subscribe({
        next: (data) => {
          this.evaluations = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Search failed. Please try again.';
          this.loading = false;
          console.error(err);
        }
      });
  }

  clearSearch(): void {
    this.searchTerm = '';
    if (this.formateurId) {
      this.loading = true;
      this.loadEvaluations(this.formateurId);
    }
  }

}
