import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EvaluationApiService, Evaluation } from '../../../services/evaluation-api.service';
import { QuizApiService } from '../../../services/QuizService';
import { CertificateApiService } from '../../../services/certificate-api.service';
import { AuthService } from '../../../core/services/auth.service';
import { BackendUser } from '../../../core/models/auth.model';
import { filter, take, timeout } from 'rxjs/operators';

interface EvaluationWithQuiz extends Evaluation {
  quizDetails?: any;
}

@Component({
  selector: 'app-evaluation-quiz-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './evaluation-quiz-detail.component.html',
  styleUrls: ['./evaluation-quiz-detail.component.css']
})
export class EvaluationQuizDetailComponent implements OnInit {
  evaluations: EvaluationWithQuiz[] = [];
  loading = true;
  expandedEvaluation: number | null = null;
  publishingEvaluationId: number | null = null;
  errorMessage: string | null = null;
  searchTerm = '';
  isApprenant = false;
  private formateurId: number | null = null;
  private apprenantFirstName = '';
  private apprenantLastName = '';

  constructor(
    private evaluationService: EvaluationApiService,
    private quizService: QuizApiService,
    private certificateService: CertificateApiService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    console.log('✅ EvaluationQuizDetailComponent initialized');
    this.initializeComponent();
  }

  private initializeComponent() {
    // Try to get user from currentUser$ with timeout
    this.authService.currentUser$
      .pipe(
        filter((user): user is BackendUser => !!user),
        take(1),
        timeout(5000) // 5 second timeout
      )
      .subscribe({
        next: (user) => {
          console.log('✅ Current user loaded from observable:', user.idUser, user.nom, user.prenom);
          this.isApprenant = user.role === 'APPRENANT';
          this.apprenantFirstName = user.prenom || '';
          this.apprenantLastName = user.nom || '';
          if (this.isApprenant) {
            this.loadPublishedEvaluationsForApprenant();
            return;
          }
          this.formateurId = user.idUser;
          this.loadEvaluations(user.idUser);
        },
        error: (err) => {
          console.warn('⚠️ Observable timeout or error, trying localStorage fallback:', err);
          this.tryLocalStorageFallback();
        }
      });
  }

  private tryLocalStorageFallback() {
    try {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson) as BackendUser;
        console.log('✅ Current user loaded from localStorage:', user.idUser, user.nom, user.prenom);
        this.isApprenant = user.role === 'APPRENANT';
        this.apprenantFirstName = user.prenom || '';
        this.apprenantLastName = user.nom || '';
        if (this.isApprenant) {
          this.loadPublishedEvaluationsForApprenant();
          return;
        }
        this.loadEvaluations(user.idUser);
      } else {
        throw new Error('No user in localStorage');
      }
    } catch (err) {
      console.error('❌ Failed to get user from localStorage:', err);
      this.errorMessage = 'Authentication failed. Please login again.';
      this.loading = false;
    }
  }

  loadEvaluations(formateurId: number) {
    console.log('📥 Loading evaluations for formateurId:', formateurId);
    this.loading = true;
    this.errorMessage = null;
    
    this.evaluationService.getByFormateur(formateurId).subscribe({
      next: (evaluations: Evaluation[]) => {
        console.log('✅ Evaluations loaded:', evaluations.length, 'evaluations found');
        if (evaluations.length === 0) {
          console.log('⚠️ No evaluations found for this formateur, trying to load quizzes directly...');
          // Try to load quizzes directly as fallback
          this.loadQuizzesByFormateur(formateurId);
          return;
        }
        this.evaluations = evaluations as EvaluationWithQuiz[];
        this.loadQuizDetails();
      },
      error: (err) => {
        console.error('❌ Error loading evaluations:', err);
        this.errorMessage = 'Failed to load evaluations: ' + (err?.message || 'Unknown error');
        this.loading = false;
      }
    });
  }

  onSearch() {
    const term = this.searchTerm.trim();

    if (this.isApprenant) {
      this.loadPublishedEvaluationsForApprenant(term);
      return;
    }

    if (!this.formateurId) {
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    if (!term) {
      this.loadEvaluations(this.formateurId);
      return;
    }

    this.evaluationService.searchEvaluations(this.formateurId, term).subscribe({
      next: (evaluations: Evaluation[]) => {
        console.log('✅ Search returned', evaluations.length, 'evaluations');
        this.evaluations = evaluations as EvaluationWithQuiz[];
        this.loadQuizDetails();
      },
      error: (err) => {
        console.error('❌ Error searching evaluations:', err);
        this.errorMessage = 'Search failed: ' + (err?.message || 'Unknown error');
        this.loading = false;
      }
    });
  }

  clearSearch() {
    this.searchTerm = '';

    if (this.isApprenant) {
      this.loadPublishedEvaluationsForApprenant();
      return;
    }

    if (this.formateurId) {
      this.loadEvaluations(this.formateurId);
    }
  }

  private loadPublishedEvaluationsForApprenant(searchTerm?: string) {
    this.loading = true;
    this.errorMessage = null;

    this.evaluationService.getPublishedForApprenant().subscribe({
      next: (evaluations: Evaluation[]) => {
        const normalized = (searchTerm || '').trim().toLowerCase();
        const filtered = !normalized
          ? evaluations
          : evaluations.filter(evaluation =>
              `${evaluation.title || ''} ${evaluation.description || ''}`.toLowerCase().includes(normalized)
            );

        this.evaluations = filtered as EvaluationWithQuiz[];
        this.loadQuizDetails();
      },
      error: (err) => {
        console.error('❌ Error loading published evaluations for apprenant:', err);
        this.errorMessage = 'Failed to load evaluations: ' + (err?.message || 'Unknown error');
        this.loading = false;
      }
    });
  }

  loadQuizDetails() {
    console.log('📥 Loading quiz details for', this.evaluations.length, 'evaluations');
    let loadCount = 0;
    const totalEvals = this.evaluations.length;

    // Handle empty evaluations list
    if (totalEvals === 0) {
      console.log('✅ No quizzes to load');
      this.loading = false;
      return;
    }

    this.evaluations.forEach((evaluation) => {
      if (evaluation.quiz?.id) {
        const quizId = evaluation.quiz.id;
        console.log(`📥 Fetching quiz details for evaluation ${evaluation.id}, quiz ID: ${quizId}`);
        const quizRequest = this.isApprenant
          ? this.quizService.getQuizForApprenant(quizId)
          : this.quizService.getQuiz(quizId);

        quizRequest.subscribe({
          next: (quizDetails) => {
            console.log(`✅ Quiz ${quizId} loaded with ${quizDetails.questions?.length || 0} questions`);
            evaluation.quizDetails = quizDetails;
            loadCount++;
            if (loadCount === totalEvals) {
              console.log('✅ All quizzes loaded successfully');
              this.loading = false;
            }
          },
          error: (err) => {
            console.error(`❌ Error loading quiz ${quizId}:`, err);
            loadCount++;
            if (loadCount === totalEvals) {
              this.loading = false;
            }
          }
        });
      } else {
        console.log(`⚠️ Evaluation ${evaluation.id} has no quiz`);
        loadCount++;
        if (loadCount === totalEvals) {
          console.log('✅ All evaluations processed');
          this.loading = false;
        }
      }
    });
  }

  loadQuizzesByFormateur(formateurId: number) {
    console.log('📥 Loading quizzes directly for formateurId:', formateurId);
    this.quizService.getQuizzesByFormateur(formateurId).subscribe({
      next: (quizzes) => {
        console.log('✅ Quizzes loaded directly:', quizzes.length, 'quizzes found');
        if (quizzes.length === 0) {
          console.log('⚠️ No quizzes found for this formateur');
          this.evaluations = [];
          this.loading = false;
          return;
        }
        // Convert quizzes to evaluation format for display
        this.evaluations = quizzes.map((quiz, index) => ({
          id: quiz.evaluationId,
          title: `Quiz ${quiz.id}`,
          description: `Created by you`,
          status: 'PUBLISHED' as const,
          formateurId: formateurId,
          quiz: { id: quiz.id, passingScore: quiz.passingScore },
          quizDetails: quiz
        }));
        this.loading = false;
        console.log('✅ Quizzes converted to evaluations format');
      },
      error: (err) => {
        console.error('❌ Error loading quizzes:', err);
        this.errorMessage = 'Failed to load quizzes: ' + (err?.message || 'Unknown error');
        this.loading = false;
      }
    });
  }

  toggleExpand(evaluationId: number) {
    this.expandedEvaluation = this.expandedEvaluation === evaluationId ? null : evaluationId;
  }

  isExpanded(evaluationId: number): boolean {
    return this.expandedEvaluation === evaluationId;
  }

  getStatusClass(status: string): string {
    return status?.toLowerCase() || 'draft';
  }

  getTotalQuestions(evaluation: EvaluationWithQuiz): number {
    return evaluation.quizDetails?.questions?.length || 0;
  }

  getTotalPoints(evaluation: EvaluationWithQuiz): number {
    return evaluation.quizDetails?.questions?.reduce((sum: number, q: any) => sum + (q.points || 0), 0) || 0;
  }

  getQuizPlayRoute(evaluation: EvaluationWithQuiz): any[] {
    if (!evaluation.quizDetails?.id) {
      return [];
    }

    if (this.isApprenant) {
      return ['/apprenant/evaluations', evaluation.id, 'quiz-play', evaluation.quizDetails.id];
    }

    return ['/formateur/evaluations', evaluation.id, 'quiz-play', evaluation.quizDetails.id];
  }

  canRequestCertificate(evaluation: EvaluationWithQuiz): boolean {
    return !!(
      this.isApprenant &&
      evaluation.passed &&
      evaluation.quiz &&
      !evaluation.certificateStatus
    );
  }

  getCertificateStatusLabel(evaluation: EvaluationWithQuiz): string {
    if (!evaluation.certificateStatus) {
      return 'Not requested';
    }
    if (evaluation.certificateStatus === 'PENDING') {
      return 'Pending approval';
    }
    if (evaluation.certificateStatus === 'APPROVED') {
      return 'Approved';
    }
    return 'Rejected';
  }

  requestCertificate(evaluation: EvaluationWithQuiz, event: Event) {
    event.stopPropagation();

    if (!this.canRequestCertificate(evaluation)) {
      return;
    }

    this.errorMessage = null;
    this.certificateService.requestCertificate({
      evaluationId: evaluation.id,
      apprenantFirstName: this.apprenantFirstName,
      apprenantLastName: this.apprenantLastName
    }).subscribe({
      next: (response) => {
        evaluation.certificateStatus = response.status;
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to request certificate.';
      }
    });
  }

  deleteEvaluation(evaluationId: number) {
    if (this.isApprenant) {
      return;
    }

    const confirmed = confirm('Do you really want to delete this evaluation?');
    if (!confirmed) {
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    this.evaluationService.delete(evaluationId).subscribe({
      next: () => {
        this.evaluations = this.evaluations.filter((evaluation) => evaluation.id !== evaluationId);
        if (this.expandedEvaluation === evaluationId) {
          this.expandedEvaluation = null;
        }
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to delete evaluation: ' + (err?.message || 'Unknown error');
        this.loading = false;
      }
    });
  }

  publishEvaluation(evaluationId: number) {
    if (this.isApprenant) {
      return;
    }

    const evaluation = this.evaluations.find((evalItem) => evalItem.id === evaluationId);
    if (!evaluation) {
      return;
    }

    this.publishingEvaluationId = evaluationId;
    this.errorMessage = null;

    this.evaluationService.publish(evaluationId).subscribe({
      next: (updatedEvaluation) => {
        evaluation.status = updatedEvaluation.status;
        this.publishingEvaluationId = null;
      },
      error: (err) => {
        this.errorMessage = 'Failed to publish evaluation: ' + (err?.message || 'Unknown error');
        this.publishingEvaluationId = null;
      }
    });
  }
}
