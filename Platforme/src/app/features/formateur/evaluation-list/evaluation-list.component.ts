import {Component, OnInit} from '@angular/core';
import { EvaluationApiService, Evaluation } from '../../../services/evaluation-api.service';
import { QuizApiService, QuizResponse } from '../../../services/QuizService';
import { CertificateApiService } from '../../../services/certificate-api.service';
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
  styleUrls: ['./evaluation-list.component.css']
})

export class EvaluationListComponent implements OnInit {
  Object = Object; // Make Object available in template

  evaluations: Evaluation[] = [];
  allEvaluations: Evaluation[] = [];
  searchTerm: string = '';
  loading: boolean = false;
  error: string | null = null;
  
  // Pagination
  pageSize: number = 6;
  currentPage: number = 1;
  totalEvaluations: number = 0;
  
  // Quiz preview
  expandedQuiz: Set<number> = new Set();
  quizCache: Record<number, any> = {};
  
  // Quiz taking (for apprenants)
  quizTakingMode = false;
  activeEvaluation: Evaluation | null = null;
  activeQuiz: any = null;
  quizAnswers: Record<number, number> = {};
  quizResult: any = null;
  submittingQuiz = false;
  requestingCertificate = false;
  
  userRole: string | null = null;
  isFormateur = false;

  constructor(
    private evaluationService: EvaluationApiService,
    private authService: AuthService,
    private quizService: QuizApiService,
    private certificateService: CertificateApiService
  ) {}

  ngOnInit(): void {
    this.authService.userRole$.pipe(filter(Boolean), take(1)).subscribe((role: any) => {
      this.userRole = role;
      this.isFormateur = role === 'FORMATEUR';
      
      if (this.isFormateur) {
        this.authService.currentUser$.pipe(filter((u): u is BackendUser => !!u), take(1))
          .subscribe(user => {
            console.log('🔍 Current user:', user);
            console.log('📌 User ID (idUser):', user.idUser);
            console.log('👤 User Role:', user.role);
            if (user.role !== 'FORMATEUR') {
              this.error = `Access denied: You are logged in as ${user.role}, not FORMATEUR`;
              this.loading = false;
              console.error(this.error);
              return;
            }
            this.loadEvaluations(user.idUser);
          });
      } else {
        // Apprenant loads published evaluations
        this.loadPublishedEvaluations();
      }
    });
  }

  loadEvaluations(formateurId: number): void {
    this.loading = true;
    this.evaluationService.getByFormateur(formateurId).subscribe({
      next: (data) => {
        this.allEvaluations = data;
        this.totalEvaluations = data.length;
        this.currentPage = 1;
        this.updatePaginatedEvaluations();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load evaluations';
        this.loading = false;
        console.error(err);
      }
    });
  }

  loadPublishedEvaluations(): void {
    this.loading = true;
    this.evaluationService.getPublishedForApprenant().subscribe({
      next: (data) => {
        this.allEvaluations = data;
        this.totalEvaluations = data.length;
        this.currentPage = 1;
        this.updatePaginatedEvaluations();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load published evaluations';
        this.loading = false;
        console.error(err);
      }
    });
  }

  updatePaginatedEvaluations(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.evaluations = this.allEvaluations.slice(start, end);
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.allEvaluations = this.allEvaluations;
      this.currentPage = 1;
      this.updatePaginatedEvaluations();
      return;
    }
    const term = this.searchTerm.toLowerCase();
    const filtered = this.allEvaluations.filter(e => 
      e.title?.toLowerCase().includes(term) || 
      e.description?.toLowerCase().includes(term)
    );
    this.totalEvaluations = filtered.length;
    this.currentPage = 1;
    this.evaluations = filtered.slice(0, this.pageSize);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.authService.currentUser$.pipe(filter((u): u is BackendUser => !!u), take(1))
      .subscribe(user => {
        this.loadEvaluations(user.idUser);
      });
  }

  toggleQuestions(e: Evaluation): void {
    if (!e.quiz?.id) return;
    
    if (this.expandedQuiz.has(e.quiz.id)) {
      this.expandedQuiz.delete(e.quiz.id);
    } else {
      // Load quiz if not cached
      if (!this.quizCache[e.quiz.id]) {
        this.quizService.getQuiz(e.quiz.id).subscribe({
          next: (quiz) => {
            if (e.quiz?.id) {
              this.quizCache[e.quiz.id] = quiz;
              this.expandedQuiz.add(e.quiz.id);
            }
          },
          error: (err) => {
            console.error('Failed to load quiz', err);
          }
        });
      } else {
        this.expandedQuiz.add(e.quiz.id);
      }
    }
  }

  publish(e: Evaluation): void {
    if (!e.id || !confirm(`Publish evaluation "${e.title}"?`)) return;
    this.evaluationService.publish(e.id).subscribe({
      next: () => {
        e.status = 'PUBLISHED';
      },
      error: (err) => {
        console.error('Failed to publish', err);
      }
    });
  }

  remove(e: Evaluation): void {
    if (!e.id || !confirm(`Delete evaluation "${e.title}"?`)) return;
    this.evaluationService.delete(e.id).subscribe({
      next: () => {
        this.allEvaluations = this.allEvaluations.filter(x => x.id !== e.id);
        this.totalEvaluations = this.allEvaluations.length;
        this.updatePaginatedEvaluations();
      },
      error: (err) => {
        console.error('Failed to delete', err);
      }
    });
  }

  nextPage(): void {
    if (this.currentPage * this.pageSize < this.totalEvaluations) {
      this.currentPage++;
      this.updatePaginatedEvaluations();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedEvaluations();
    }
  }

  getTotalPages(): number {
    return Math.ceil(this.totalEvaluations / this.pageSize);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.getTotalPages()) return;
    this.currentPage = page;
    this.updatePaginatedEvaluations();
  }

  get hasNextPage(): boolean {
    return this.currentPage * this.pageSize < this.totalEvaluations;
  }

  get hasPrevPage(): boolean {
    return this.currentPage > 1;
  }

  // Quiz taking methods for apprenants
  startQuiz(e: Evaluation): void {
    this.activeEvaluation = e;
    this.quizTakingMode = true;
    this.quizAnswers = {};
    this.quizResult = null;

    if (e.quiz?.id) {
      this.quizService.getQuizForApprenant(e.quiz.id).subscribe({
        next: (data) => {
          this.activeQuiz = data;
        },
        error: (err) => {
          console.error('Failed to load quiz', err);
          this.error = 'Failed to load quiz. Please try again.';
        }
      });
    }
  }

  selectAnswer(questionId: number, choiceId: number): void {
    this.quizAnswers[questionId] = choiceId;
  }

  submitQuiz(): void {
    if (!this.activeQuiz?.id) return;
    
    const answers = Object.entries(this.quizAnswers).map(([qid, cid]) => ({
      questionId: parseInt(qid),
      choiceId: cid as number
    }));

    if (answers.length === 0) {
      alert('Please answer at least one question');
      return;
    }

    this.submittingQuiz = true;
    this.quizService.submitQuizForApprenant(this.activeQuiz.id, { answers })
      .subscribe({
        next: (result) => {
          this.quizResult = result;
          this.submittingQuiz = false;
        },
        error: (err) => {
          console.error('Failed to submit quiz', err);
          this.error = 'Failed to submit quiz. Please try again.';
          this.submittingQuiz = false;
        }
      });
  }

  backToList(): void {
    this.quizTakingMode = false;
    this.activeEvaluation = null;
    this.activeQuiz = null;
    this.quizAnswers = {};
    this.quizResult = null;
  }

  requestCertificate(): void {
    if (!this.activeEvaluation || !this.quizResult?.passed) {
      alert('You must pass the quiz before requesting a certificate');
      return;
    }

    this.authService.currentUser$.pipe(filter((u): u is BackendUser => !!u), take(1))
      .subscribe(user => {
        this.requestingCertificate = true;
        this.certificateService.requestCertificate({
          evaluationId: this.activeEvaluation!.id,
          apprenantFirstName: user.prenom,
          apprenantLastName: user.nom
        }).subscribe({
          next: (cert) => {
            this.requestingCertificate = false;
            alert(`✅ Certificate request submitted! Status: ${cert.status}`);
            this.backToList();
          },
          error: (err) => {
            this.requestingCertificate = false;
            console.error('Failed to request certificate', err);
            alert('❌ Failed to request certificate. Please try again.');
          }
        });
      });
  }
}
