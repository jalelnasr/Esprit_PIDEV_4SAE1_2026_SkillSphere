import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuizService, QuizData, QuizRequest } from '@core/services/quiz.service';
import { ToastService } from '@core/services/toast.service';

interface OptionForm { text: string; isCorrect: boolean; }
interface QuestionForm { text: string; options: OptionForm[]; }

@Component({
  selector: 'app-quiz-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="quiz-builder">
      <div class="builder-header">
        <h3>{{ existingQuiz ? '✏️ Edit Quiz' : '➕ Add Quiz' }}</h3>
        <button class="btn-close" (click)="cancel.emit()">×</button>
      </div>

      <div class="builder-body">
        <!-- Quiz settings -->
        <div class="form-row">
          <div class="form-group">
            <label>Quiz Title *</label>
            <input type="text" [(ngModel)]="quizTitle" placeholder="Ex: Chapter 1 Quiz" class="form-input" />
          </div>
          <div class="form-group form-group-sm">
            <label>Pass Threshold (%)</label>
            <input type="number" [(ngModel)]="passThreshold" min="0" max="100" class="form-input" />
          </div>
        </div>

        <!-- Questions -->
        <div class="questions-section">
          <div class="questions-header">
            <span>Questions ({{ questions.length }})</span>
            <button class="btn-add-q" (click)="addQuestion()">+ Add Question</button>
          </div>

          <div class="question-card" *ngFor="let q of questions; let qi = index">
            <div class="question-header">
              <span class="q-num">Q{{ qi + 1 }}</span>
              <input type="text" [(ngModel)]="q.text" placeholder="Question text..." class="q-input" />
              <button class="btn-remove" (click)="removeQuestion(qi)" title="Remove">×</button>
            </div>

            <div class="options-list">
              <div class="option-row" *ngFor="let opt of q.options; let oi = index">
                <input
                  type="radio"
                  [name]="'correct-' + qi"
                  [checked]="opt.isCorrect"
                  (change)="setCorrect(qi, oi)"
                  title="Mark as correct" />
                <input type="text" [(ngModel)]="opt.text" placeholder="Option {{ oi + 1 }}..." class="opt-input" />
                <button class="btn-remove-sm" (click)="removeOption(qi, oi)" *ngIf="q.options.length > 2">×</button>
              </div>
              <button class="btn-add-opt" (click)="addOption(qi)" *ngIf="q.options.length < 5">
                + Add option
              </button>
            </div>
          </div>

          <div class="empty-questions" *ngIf="questions.length === 0">
            Click "Add Question" to start building your quiz
          </div>
        </div>
      </div>

      <div class="builder-footer">
        <button class="btn-cancel" (click)="cancel.emit()">Cancel</button>
        <button class="btn-delete" *ngIf="existingQuiz" (click)="deleteQuiz()">Delete Quiz</button>
        <button class="btn-save" (click)="save()" [disabled]="saving || questions.length === 0">
          {{ saving ? 'Saving...' : (existingQuiz ? 'Update Quiz' : 'Create Quiz') }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .quiz-builder {
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.15);
      width: 100%;
      max-width: 680px;
    }

    .builder-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #eee;
    }
    .builder-header h3 { margin: 0; font-size: 1.1rem; color: #333; }

    .btn-close {
      background: none; border: none; font-size: 1.5rem;
      cursor: pointer; color: #999; line-height: 1;
    }
    .btn-close:hover { color: #333; }

    .builder-body { padding: 1.5rem; max-height: 60vh; overflow-y: auto; }

    .form-row { display: flex; gap: 1rem; margin-bottom: 1rem; }
    .form-group { flex: 1; }
    .form-group-sm { flex: 0 0 140px; }
    .form-group label { display: block; font-size: 0.85rem; font-weight: 600; color: #555; margin-bottom: 4px; }
    .form-input {
      width: 100%; padding: 0.5rem 0.75rem;
      border: 1px solid #ddd; border-radius: 6px;
      font-size: 0.9rem; box-sizing: border-box;
    }
    .form-input:focus { outline: none; border-color: #0F9B8E; }

    .questions-section { margin-top: 1rem; }
    .questions-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 0.75rem;
      font-weight: 600; color: #333; font-size: 0.9rem;
    }

    .btn-add-q {
      padding: 0.3rem 0.75rem;
      background: #0F9B8E; color: #fff;
      border: none; border-radius: 6px;
      font-size: 0.8rem; cursor: pointer;
    }
    .btn-add-q:hover { background: #0d8a7e; }

    .question-card {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 0.75rem;
    }

    .question-header {
      display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;
    }
    .q-num {
      background: #0F9B8E; color: #fff;
      width: 28px; height: 28px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.75rem; font-weight: 700; flex-shrink: 0;
    }
    .q-input {
      flex: 1; padding: 0.4rem 0.6rem;
      border: 1px solid #ddd; border-radius: 6px; font-size: 0.9rem;
    }
    .q-input:focus { outline: none; border-color: #0F9B8E; }

    .btn-remove {
      background: none; border: none; color: #dc3545;
      font-size: 1.2rem; cursor: pointer; padding: 0 4px;
    }

    .options-list { padding-left: 0.5rem; }
    .option-row {
      display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.4rem;
    }
    .option-row input[type="radio"] { cursor: pointer; accent-color: #0F9B8E; }
    .opt-input {
      flex: 1; padding: 0.35rem 0.6rem;
      border: 1px solid #ddd; border-radius: 6px; font-size: 0.85rem;
    }
    .opt-input:focus { outline: none; border-color: #0F9B8E; }

    .btn-remove-sm {
      background: none; border: none; color: #aaa;
      font-size: 1rem; cursor: pointer;
    }
    .btn-remove-sm:hover { color: #dc3545; }

    .btn-add-opt {
      background: none; border: 1px dashed #ccc;
      color: #888; padding: 0.25rem 0.75rem;
      border-radius: 6px; font-size: 0.8rem; cursor: pointer;
      margin-top: 0.25rem; transition: all 0.2s;
    }
    .btn-add-opt:hover { border-color: #0F9B8E; color: #0F9B8E; }

    .empty-questions {
      text-align: center; color: #aaa; font-size: 0.85rem;
      padding: 1.5rem; border: 1px dashed #ddd; border-radius: 8px;
    }

    .builder-footer {
      display: flex; gap: 0.75rem; padding: 1rem 1.5rem;
      border-top: 1px solid #eee; justify-content: flex-end;
    }

    .btn-cancel {
      padding: 0.5rem 1.25rem; background: #fff;
      border: 1px solid #ddd; border-radius: 6px;
      color: #666; cursor: pointer; font-size: 0.9rem;
    }
    .btn-cancel:hover { background: #f5f5f5; }

    .btn-delete {
      padding: 0.5rem 1.25rem; background: #fff;
      border: 1px solid #dc3545; border-radius: 6px;
      color: #dc3545; cursor: pointer; font-size: 0.9rem;
    }
    .btn-delete:hover { background: #dc3545; color: #fff; }

    .btn-save {
      padding: 0.5rem 1.5rem; background: #0F9B8E;
      border: none; border-radius: 6px;
      color: #fff; cursor: pointer; font-size: 0.9rem; font-weight: 600;
    }
    .btn-save:hover:not(:disabled) { background: #0d8a7e; }
    .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class QuizBuilderComponent implements OnInit {
  @Input() lessonId!: number;
  @Input() existingQuiz: QuizData | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  quizTitle = '';
  passThreshold = 70;
  questions: QuestionForm[] = [];
  saving = false;

  constructor(private quizService: QuizService, private toastService: ToastService) {}

  ngOnInit(): void {
    if (this.existingQuiz) {
      this.quizTitle = this.existingQuiz.title;
      this.passThreshold = this.existingQuiz.passThreshold;
      this.questions = this.existingQuiz.questions.map(q => ({
        text: q.text,
        options: q.options.map(o => ({ text: o.text, isCorrect: o.isCorrect === true }))
      }));
    }
  }

  addQuestion(): void {
    this.questions.push({
      text: '',
      options: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ]
    });
  }

  removeQuestion(qi: number): void {
    this.questions.splice(qi, 1);
  }

  addOption(qi: number): void {
    this.questions[qi].options.push({ text: '', isCorrect: false });
  }

  removeOption(qi: number, oi: number): void {
    this.questions[qi].options.splice(oi, 1);
  }

  setCorrect(qi: number, oi: number): void {
    this.questions[qi].options.forEach((o, i) => o.isCorrect = i === oi);
  }

  save(): void {
    if (!this.quizTitle.trim()) {
      this.toastService.error('Quiz title is required');
      return;
    }
    if (this.questions.length === 0) {
      this.toastService.error('Add at least one question');
      return;
    }
    for (const q of this.questions) {
      if (!q.text.trim()) { this.toastService.error('All questions must have text'); return; }
      if (!q.options.some(o => o.isCorrect)) { this.toastService.error('Each question needs a correct answer marked'); return; }
      if (q.options.some(o => !o.text.trim())) { this.toastService.error('All options must have text'); return; }
    }

    const request: QuizRequest = {
      title: this.quizTitle,
      passThreshold: this.passThreshold,
      isBlocking: false,
      questions: this.questions.map((q, qi) => ({
        text: q.text,
        orderIndex: qi,
        options: q.options.map((o, oi) => ({ text: o.text, isCorrect: o.isCorrect, orderIndex: oi }))
      }))
    };

    this.saving = true;
    const call = this.existingQuiz
      ? this.quizService.updateQuiz(this.existingQuiz.id, request)
      : this.quizService.createQuiz(this.lessonId, request);

    call.subscribe({
      next: () => {
        this.toastService.success(this.existingQuiz ? 'Quiz updated!' : 'Quiz created!');
        this.saving = false;
        this.saved.emit();
      },
      error: () => {
        this.toastService.error('Error saving quiz');
        this.saving = false;
      }
    });
  }

  deleteQuiz(): void {
    if (!this.existingQuiz || !confirm('Delete this quiz? All attempts will be lost.')) return;
    this.quizService.deleteQuiz(this.existingQuiz.id).subscribe({
      next: () => {
        this.toastService.success('Quiz deleted');
        this.saved.emit();
      },
      error: () => this.toastService.error('Error deleting quiz')
    });
  }
}
