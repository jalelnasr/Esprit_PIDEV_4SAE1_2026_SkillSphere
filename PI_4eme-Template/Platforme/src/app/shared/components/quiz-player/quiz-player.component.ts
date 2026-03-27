import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuizService, QuizData, QuizResult } from '@core/services/quiz.service';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-quiz-player',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="quiz-player">
      <!-- Not started -->
      <div class="quiz-intro" *ngIf="state === 'intro'">
        <div class="quiz-icon">📝</div>
        <h3>{{ quiz.title }}</h3>
        <p>{{ quiz.questions.length }} questions · Pass: {{ quiz.passThreshold }}%</p>
        <div class="prev-attempt" *ngIf="previousAttempt">
          <span [class.passed]="previousAttempt.passed" [class.failed]="!previousAttempt.passed">
            {{ previousAttempt.passed ? '✅' : '❌' }} Previous score: {{ previousAttempt.score }}%
          </span>
        </div>
        <button class="btn-start" (click)="startQuiz()">
          {{ previousAttempt ? 'Retake Quiz' : 'Start Quiz' }}
        </button>
      </div>

      <!-- Taking quiz -->
      <div class="quiz-taking" *ngIf="state === 'taking'">
        <div class="quiz-progress">
          <span>Question {{ currentIndex + 1 }} / {{ quiz.questions.length }}</span>
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="((currentIndex + 1) / quiz.questions.length) * 100"></div>
          </div>
        </div>

        <div class="question-block" *ngIf="currentQuestion">
          <p class="question-text">{{ currentQuestion.text }}</p>
          <div class="options-list">
            <label
              *ngFor="let opt of currentQuestion.options"
              class="option-label"
              [class.selected]="selectedAnswers[currentQuestion.id] === opt.id">
              <input
                type="radio"
                [name]="'q-' + currentQuestion.id"
                [value]="opt.id"
                [(ngModel)]="selectedAnswers[currentQuestion.id]" />
              <span class="option-text">{{ opt.text }}</span>
            </label>
          </div>
        </div>

        <div class="quiz-nav">
          <button class="btn-prev" (click)="prev()" [disabled]="currentIndex === 0">← Prev</button>
          <button class="btn-next" (click)="next()" *ngIf="currentIndex < quiz.questions.length - 1"
                  [disabled]="!selectedAnswers[currentQuestion?.id ?? 0]">
            Next →
          </button>
          <button class="btn-submit" (click)="submit()" *ngIf="currentIndex === quiz.questions.length - 1"
                  [disabled]="!allAnswered || submitting">
            {{ submitting ? 'Submitting...' : 'Submit Quiz' }}
          </button>
        </div>
      </div>

      <!-- Results -->
      <div class="quiz-results" *ngIf="state === 'results' && result">
        <div class="result-header" [class.passed]="result.passed" [class.failed]="!result.passed">
          <div class="result-icon">{{ result.passed ? '🎉' : '😔' }}</div>
          <div class="result-score">{{ result.score }}%</div>
          <div class="result-label">{{ result.passed ? 'Passed!' : 'Not passed' }}</div>
          <div class="result-detail">{{ result.correctCount }} / {{ result.totalQuestions }} correct · Pass: {{ result.passThreshold }}%</div>
        </div>

        <div class="results-breakdown">
          <div
            *ngFor="let r of result.results; let i = index"
            class="result-item"
            [class.correct]="r.correct"
            [class.wrong]="!r.correct">
            <span class="result-icon-sm">{{ r.correct ? '✅' : '❌' }}</span>
            <div class="result-q">
              <p class="result-q-text">{{ r.questionText }}</p>
              <p class="result-answer" *ngIf="!r.correct">
                Your answer: {{ getOptionText(i, r.chosenOptionId) }} ·
                Correct: {{ getOptionText(i, r.correctOptionId) }}
              </p>
            </div>
          </div>
        </div>

        <button class="btn-retake" (click)="retake()">Retake Quiz</button>
      </div>
    </div>
  `,
  styles: [`
    .quiz-player {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 10px;
      padding: 1.5rem;
      margin-top: 1.5rem;
    }

    /* Intro */
    .quiz-intro { text-align: center; padding: 1rem; }
    .quiz-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }
    .quiz-intro h3 { margin: 0 0 0.25rem; color: #333; font-size: 1.1rem; }
    .quiz-intro p { color: #888; font-size: 0.9rem; margin: 0 0 1rem; }

    .prev-attempt { margin-bottom: 1rem; }
    .prev-attempt .passed { color: #10B981; font-weight: 600; font-size: 0.9rem; }
    .prev-attempt .failed { color: #ef4444; font-weight: 600; font-size: 0.9rem; }

    .btn-start {
      padding: 0.6rem 2rem; background: #0F9B8E;
      color: #fff; border: none; border-radius: 8px;
      font-size: 1rem; font-weight: 600; cursor: pointer;
    }
    .btn-start:hover { background: #0d8a7e; }

    /* Taking */
    .quiz-progress { margin-bottom: 1rem; }
    .quiz-progress span { font-size: 0.85rem; color: #888; display: block; margin-bottom: 4px; }
    .progress-bar { height: 4px; background: #e9ecef; border-radius: 2px; }
    .progress-fill { height: 100%; background: #0F9B8E; border-radius: 2px; transition: width 0.3s; }

    .question-text { font-size: 1rem; font-weight: 600; color: #333; margin-bottom: 1rem; }

    .options-list { display: flex; flex-direction: column; gap: 0.5rem; }

    .option-label {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.75rem 1rem;
      background: #fff; border: 2px solid #e9ecef;
      border-radius: 8px; cursor: pointer; transition: all 0.2s;
    }
    .option-label:hover { border-color: #0F9B8E; background: #f0fffe; }
    .option-label.selected { border-color: #0F9B8E; background: #e8f8f7; }
    .option-label input[type="radio"] { accent-color: #0F9B8E; }
    .option-text { font-size: 0.9rem; color: #333; }

    .quiz-nav {
      display: flex; justify-content: space-between; align-items: center;
      margin-top: 1.5rem;
    }

    .btn-prev, .btn-next {
      padding: 0.5rem 1.25rem; background: #fff;
      border: 1px solid #ddd; border-radius: 6px;
      color: #555; cursor: pointer; font-size: 0.9rem;
    }
    .btn-prev:hover:not(:disabled), .btn-next:hover:not(:disabled) { border-color: #0F9B8E; color: #0F9B8E; }
    .btn-prev:disabled, .btn-next:disabled { opacity: 0.4; cursor: not-allowed; }

    .btn-submit {
      padding: 0.5rem 1.5rem; background: #0F9B8E;
      border: none; border-radius: 6px;
      color: #fff; cursor: pointer; font-size: 0.9rem; font-weight: 600;
    }
    .btn-submit:hover:not(:disabled) { background: #0d8a7e; }
    .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Results */
    .result-header {
      text-align: center; padding: 1.5rem;
      border-radius: 10px; margin-bottom: 1rem;
    }
    .result-header.passed { background: #d1fae5; }
    .result-header.failed { background: #fee2e2; }
    .result-icon { font-size: 2.5rem; }
    .result-score { font-size: 2.5rem; font-weight: 700; color: #333; }
    .result-label { font-size: 1.1rem; font-weight: 600; color: #333; }
    .result-detail { font-size: 0.85rem; color: #666; margin-top: 0.25rem; }

    .results-breakdown { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }

    .result-item {
      display: flex; align-items: flex-start; gap: 0.75rem;
      padding: 0.75rem; border-radius: 8px;
    }
    .result-item.correct { background: #f0fdf4; }
    .result-item.wrong { background: #fef2f2; }
    .result-icon-sm { font-size: 1rem; flex-shrink: 0; margin-top: 2px; }
    .result-q-text { margin: 0 0 4px; font-size: 0.9rem; color: #333; font-weight: 500; }
    .result-answer { margin: 0; font-size: 0.8rem; color: #888; }

    .btn-retake {
      width: 100%; padding: 0.6rem;
      background: #fff; border: 1px solid #0F9B8E;
      color: #0F9B8E; border-radius: 8px;
      font-size: 0.9rem; cursor: pointer; transition: all 0.2s;
    }
    .btn-retake:hover { background: #0F9B8E; color: #fff; }
  `]
})
export class QuizPlayerComponent implements OnInit {
  @Input() quiz!: QuizData;
  @Input() enrollmentId!: number;
  @Output() completed = new EventEmitter<QuizResult>();

  state: 'intro' | 'taking' | 'results' = 'intro';
  currentIndex = 0;
  selectedAnswers: { [questionId: number]: number } = {};
  result: QuizResult | null = null;
  submitting = false;
  previousAttempt: { score: number; passed: boolean } | null = null;

  get currentQuestion() { return this.quiz.questions[this.currentIndex]; }
  get allAnswered(): boolean {
    return this.quiz.questions.every(q => this.selectedAnswers[q.id] != null);
  }

  constructor(private quizService: QuizService, private toastService: ToastService) {}

  ngOnInit(): void {
    this.quizService.getMyAttempt(this.quiz.id).subscribe({
      next: attempt => this.previousAttempt = attempt,
      error: () => {}
    });
  }

  startQuiz(): void {
    this.selectedAnswers = {};
    this.currentIndex = 0;
    this.state = 'taking';
  }

  prev(): void { if (this.currentIndex > 0) this.currentIndex--; }
  next(): void { if (this.currentIndex < this.quiz.questions.length - 1) this.currentIndex++; }

  submit(): void {
    this.submitting = true;
    const answers = this.quiz.questions.map(q => ({
      questionId: q.id,
      chosenOptionId: this.selectedAnswers[q.id]
    }));

    this.quizService.submitQuiz(this.quiz.id, { enrollmentId: this.enrollmentId, answers }).subscribe({
      next: result => {
        this.result = result;
        this.state = 'results';
        this.submitting = false;
        this.completed.emit(result);
        this.previousAttempt = { score: result.score, passed: result.passed };
      },
      error: () => {
        this.toastService.error('Error submitting quiz');
        this.submitting = false;
      }
    });
  }

  retake(): void {
    this.selectedAnswers = {};
    this.currentIndex = 0;
    this.result = null;
    this.state = 'taking';
  }

  getOptionText(questionIndex: number, optionId: number): string {
    const q = this.quiz.questions[questionIndex];
    return q?.options.find(o => o.id === optionId)?.text ?? '—';
  }
}
