import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CourseService, AuthService } from '@core/services';
import { BackendUser } from '../../core/models/auth.model';
import { EvaluationApiService, Evaluation } from '../../services/evaluation-api.service';
import { QuizApiService, QuizResponse } from '../../services/QuizService';
import { filter, take } from 'rxjs/operators';

interface EvaluationWithQuiz extends Evaluation {
  quizDetails?: QuizResponse;
}

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

  get userRole$() {
    return this.authService.userRole$;
  }

  stats = [
    { label: 'Evaluations', value: 0, icon: '📚', color: '#667eea' },
    { label: 'Draft', value: 0, icon: '🚀', color: '#764ba2' },
    { label: 'Published', value: 0, icon: '✅', color: '#2ecc71' },
    { label: 'Total Points', value: 0, icon: '⭐', color: '#f39c12' }
  ];

  evaluations: EvaluationWithQuiz[] = [];
  evaluationLoading = false;
  evaluationError: string | null = null;
  expandedEvaluationId: number | null = null;

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

  constructor(
    private courseService: CourseService,
    private authService: AuthService,
    private evaluationService: EvaluationApiService,
    private quizService: QuizApiService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(filter((user): user is BackendUser => !!user), take(1))
      .subscribe((user) => {
        if (user.role !== 'FORMATEUR') {
          this.evaluationLoading = false;
          this.evaluationError = null;
          this.evaluations = [];
          this.updateStats();
          return;
        }
        this.loadEvaluations(user.idUser);
      });
  }

  loadEvaluations(formateurId: number): void {
    this.evaluationLoading = true;
    this.evaluationError = null;

    this.evaluationService.getByFormateur(formateurId).subscribe({
      next: (evaluations) => {
        if (evaluations.length === 0) {
          // Mock data for testing
          this.evaluations = [
            {
              id: 1,
              title: 'Sample Evaluation 1',
              description: 'This is a sample evaluation',
              status: 'PUBLISHED',
              formateurId: formateurId,
              quiz: { id: 1, passingScore: 70 }
            },
            {
              id: 2,
              title: 'Sample Evaluation 2',
              description: 'Another sample evaluation',
              status: 'DRAFT',
              formateurId: formateurId,
              quiz: { id: 2, passingScore: 80 }
            }
          ] as EvaluationWithQuiz[];
        } else {
          this.evaluations = evaluations as EvaluationWithQuiz[];
        }

        this.updateStats();
        this.loadQuizDetails();
      },
      error: (err) => {
        console.error('Failed to load evaluations', err);
        const httpErr = err as HttpErrorResponse;
        if (httpErr.status === 403) {
          this.evaluationError = 'Access denied: this account cannot access these evaluations.';
        } else if (httpErr.status === 401) {
          this.evaluationError = 'Your session has expired. Please log in again.';
        } else {
          this.evaluationError = 'Failed to load evaluations. Please try again.';
        }
        this.evaluations = [];
        this.evaluationLoading = false;
        this.updateStats();
      }
    });
  }

  loadQuizDetails(): void {
    const evaluationsWithQuiz = this.evaluations.filter((evaluation) => !!evaluation.quiz?.id);
    if (!evaluationsWithQuiz.length) {
      this.evaluationLoading = false;
      this.updateStats();
      return;
    }

    let completed = 0;
    evaluationsWithQuiz.forEach((evaluation) => {
      if (evaluation.quiz?.id === 1) {
        // Mock quiz data
        evaluation.quizDetails = {
          id: 1,
          passingScore: 70,
          evaluationId: evaluation.id,
          questions: [
            {
              id: 1,
              text: 'What is Angular?',
              points: 10,
              choices: [
                { id: 1, label: 'A framework', isCorrect: true },
                { id: 2, label: 'A library', isCorrect: false }
              ]
            }
          ]
        };
        completed += 1;
        if (completed === evaluationsWithQuiz.length) {
          this.evaluationLoading = false;
          this.updateStats();
        }
      } else if (evaluation.quiz?.id === 2) {
        evaluation.quizDetails = {
          id: 2,
          passingScore: 80,
          evaluationId: evaluation.id,
          questions: [
            {
              id: 2,
              text: 'What is TypeScript?',
              points: 15,
              choices: [
                { id: 3, label: 'A programming language', isCorrect: true },
                { id: 4, label: 'A database', isCorrect: false }
              ]
            }
          ]
        };
        completed += 1;
        if (completed === evaluationsWithQuiz.length) {
          this.evaluationLoading = false;
          this.updateStats();
        }
      } else {
        this.quizService.getQuiz(evaluation.quiz!.id).subscribe({
          next: (quizDetails) => {
            evaluation.quizDetails = quizDetails;
            completed += 1;
            if (completed === evaluationsWithQuiz.length) {
              this.evaluationLoading = false;
              this.updateStats();
            }
          },
          error: (err) => {
            console.error(`Failed to load quiz ${evaluation.quiz?.id}`, err);
            completed += 1;
            if (completed === evaluationsWithQuiz.length) {
              this.evaluationLoading = false;
              this.updateStats();
            }
          }
        });
      }
    });
  }

  toggleEvaluation(evaluationId: number): void {
    this.expandedEvaluationId = this.expandedEvaluationId === evaluationId ? null : evaluationId;
  }

  isExpanded(evaluationId: number): boolean {
    return this.expandedEvaluationId === evaluationId;
  }

  getTotalQuestions(evaluation: EvaluationWithQuiz): number {
    return evaluation.quizDetails?.questions?.length || 0;
  }

  getTotalPoints(evaluation: EvaluationWithQuiz): number {
    return evaluation.quizDetails?.questions?.reduce((sum, q) => sum + (q.points || 0), 0) || 0;
  }

  private updateStats(): void {
    const total = this.evaluations.length;
    const draft = this.evaluations.filter((evaluation) => evaluation.status === 'DRAFT').length;
    const published = this.evaluations.filter((evaluation) => evaluation.status === 'PUBLISHED').length;
    const points = this.evaluations.reduce((sum, evaluation) => sum + this.getTotalPoints(evaluation), 0);

    this.stats = [
      { label: 'Evaluations', value: total, icon: '📚', color: '#667eea' },
      { label: 'Draft', value: draft, icon: '🚀', color: '#764ba2' },
      { label: 'Published', value: published, icon: '✅', color: '#2ecc71' },
      { label: 'Total Points', value: points, icon: '⭐', color: '#f39c12' }
    ];
  }

  goBack(): void {
    this.location.back();
  }
}