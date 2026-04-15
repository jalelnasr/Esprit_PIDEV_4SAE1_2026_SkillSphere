import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  QuizApiService,
  QuizResponse,
  ApprenantQuizSubmissionRequest
} from '../../../services/QuizService';
import { AuthService } from '../../../core/services/auth.service';

type PlayChoice = {
  id: number;
  label: string;
  isCorrect?: boolean;
};

type PlayQuestion = {
  id: number;
  text: string;
  points: number;
  choices: PlayChoice[];
};

type PlayQuiz = {
  id: number;
  evaluationId: number;
  passingScore?: number;
  questions: PlayQuestion[];
};

@Component({
  selector: 'app-quiz-play',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './quiz-play.component.html',
  styleUrls: ['./quiz-play.component.css']
})
export class QuizPlayComponent implements OnInit {
  quizId!: number;
  evaluationId!: number;
  quiz: PlayQuiz | null = null;
  quizForm!: FormGroup;
  loading = true;
  submitting = false;
  submitError: string | null = null;
  resultMessage: string | null = null;
  isApprenant = false;
  currentQuestionIndex = 0;
  selectedAnswers: Map<number, number> = new Map(); // questionId -> choiceId
  quizCompleted = false;
  score = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizApiService,
    private fb: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.quizId = Number(this.route.snapshot.paramMap.get('quizId'));
    this.evaluationId = Number(this.route.snapshot.paramMap.get('id'));
    this.isApprenant = this.authService.getUserRole() === 'APPRENANT';

    this.loadQuiz();
    this.initializeForm();
  }

  loadQuiz() {
    const request = this.isApprenant
      ? this.quizService.getQuizForApprenant(this.quizId)
      : this.quizService.getQuiz(this.quizId);

    request.subscribe({
      next: (quiz) => {
        this.quiz = {
          id: quiz.id,
          evaluationId: quiz.evaluationId,
          passingScore: (quiz as QuizResponse).passingScore,
          questions: quiz.questions || []
        };
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading quiz:', err);
        this.loading = false;
      }
    });
  }

  initializeForm() {
    this.quizForm = this.fb.group({});
  }

  get currentQuestion(): PlayQuestion | undefined {
    return this.quiz?.questions?.[this.currentQuestionIndex];
  }

  get passingScore(): number {
    return this.quiz?.passingScore ?? 0;
  }

  get answeredCount(): number {
    return this.selectedAnswers.size;
  }

  selectAnswer(choiceId: number) {
    if (this.currentQuestion) {
      this.selectedAnswers.set(this.currentQuestion.id, choiceId);
    }
  }

  isAnswerSelected(choiceId: number): boolean {
    if (!this.currentQuestion) return false;
    return this.selectedAnswers.get(this.currentQuestion.id) === choiceId;
  }

  nextQuestion() {
    if (this.currentQuestionIndex < (this.quiz?.questions?.length || 0) - 1) {
      this.currentQuestionIndex++;
    }
  }

  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  canGoNext(): boolean {
    return this.currentQuestionIndex < (this.quiz?.questions?.length || 0) - 1;
  }

  canGoPrevious(): boolean {
    return this.currentQuestionIndex > 0;
  }

  submitQuiz() {
    if (!this.quiz) return;

    this.submitError = null;
    this.resultMessage = null;

    if (!this.allQuestionsAnswered) {
      this.submitError = 'Please answer all questions before submitting the quiz.';
      return;
    }

    if (this.isApprenant) {
      const answers = Array.from(this.selectedAnswers.entries()).map(([questionId, choiceId]) => ({
        questionId,
        choiceId
      }));

      const payload: ApprenantQuizSubmissionRequest = { answers };
      this.submitting = true;

      this.quizService.submitQuizForApprenant(this.quizId, payload).subscribe({
        next: (result) => {
          this.score = result.score;
          this.quiz = {
            ...this.quiz!,
            passingScore: result.passingScore
          };

          if (result.alreadyPassed && result.improved === false) {
            this.resultMessage = `Already passed. Best score kept at ${result.score}%.`;
          } else if (result.improved) {
            this.resultMessage = `New best score: ${result.score}%.`;
          } else {
            this.resultMessage = `Current best score: ${result.score}%.`;
          }

          if (typeof result.currentAttemptScore === 'number' && result.currentAttemptScore < result.score) {
            this.resultMessage += ` This attempt scored ${result.currentAttemptScore}%.`;
          }

          this.quizCompleted = true;
          this.submitting = false;
        },
        error: (err) => {
          console.error('Error submitting quiz:', err);
          this.submitError = err?.error?.message || 'Failed to submit quiz. Please try again.';
          this.submitting = false;
        }
      });

      return;
    }

    // Calculate score
    let totalPoints = 0;
    let earnedPoints = 0;

    this.quiz.questions?.forEach((question) => {
      const selectedChoiceId = this.selectedAnswers.get(question.id);
      const selectedChoice = question.choices?.find(c => c.id === selectedChoiceId);
      
      totalPoints += question.points || 0;
      
      if (selectedChoice?.isCorrect) {
        earnedPoints += question.points || 0;
      }
    });

    this.score = Math.round((earnedPoints / totalPoints) * 100);
    this.quizCompleted = true;
  }

  goBack() {
    if (this.isApprenant) {
      this.router.navigate(['/apprenant/evaluations/quizzes']);
      return;
    }

    this.router.navigate([`/formateur/evaluations/${this.evaluationId}/manage`]);
  }

  goToEvaluations() {
    if (this.isApprenant) {
      this.router.navigate(['/apprenant/evaluations/quizzes']);
      return;
    }

    this.router.navigate(['/formateur/evaluations']);
  }

  retryQuiz() {
    this.selectedAnswers.clear();
    this.currentQuestionIndex = 0;
    this.quizCompleted = false;
    this.score = 0;
    this.submitError = null;
    this.resultMessage = null;
  }

  get allQuestionsAnswered(): boolean {
    return this.quiz?.questions?.every(q => this.selectedAnswers.has(q.id)) || false;
  }

  isCorrect(question: PlayQuestion): boolean {
    const selectedChoiceId = this.selectedAnswers.get(question.id);
    if (!selectedChoiceId) return false;
    return question.choices?.find(c => c.id === selectedChoiceId)?.isCorrect || false;
  }

  isIncorrect(question: PlayQuestion): boolean {
    const selectedChoiceId = this.selectedAnswers.get(question.id);
    if (!selectedChoiceId) return false;
    return !this.isCorrect(question);
  }

  getSelectedAnswerLabel(question: PlayQuestion): string {
    const selectedChoiceId = this.selectedAnswers.get(question.id);
    if (!selectedChoiceId) return 'Not answered';
    return question.choices?.find(c => c.id === selectedChoiceId)?.label || 'Not answered';
  }

  getCorrectAnswerLabel(question: PlayQuestion): string {
    return question.choices?.find(c => c.isCorrect)?.label || '';
  }
}
