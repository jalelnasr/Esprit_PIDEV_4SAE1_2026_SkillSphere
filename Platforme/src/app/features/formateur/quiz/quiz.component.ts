import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormBuilder, Validators, ReactiveFormsModule, FormGroup, FormArray} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {QuizApiService, QuizResponse} from '../../../services/QuizService';

@Component({
  selector: 'app-quiz',
  standalone: true,
 imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './quiz.component.html',
    styleUrls: ['./quiz.component.css'] 
})
export class QuizComponent  implements OnInit{


  evaluationId!: number;
  quiz!: QuizResponse;
  quizForm!: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private quizService: QuizApiService
  ) {}

  ngOnInit() {
    this.evaluationId = Number(this.route.snapshot.paramMap.get('id'));

    this.quizForm = this.fb.group({
      passingScore: [50, Validators.required],
      questions: this.fb.array([])
    });
  }
  getChoices(questionIndex: number): FormArray {
    return this.questions.at(questionIndex).get('choices') as FormArray;
  }
  get questions(): FormArray {
    return this.quizForm.get('questions') as FormArray;
  }

  addQuestion() {
    const questionGroup = this.fb.group({
      text: ['', Validators.required],
      points: [1, Validators.required],
      choices: this.fb.array([])
    });

    this.questions.push(questionGroup);
  }

  addChoice(questionIndex: number) {
    const choices = this.questions.at(questionIndex).get('choices') as FormArray;

    choices.push(
      this.fb.group({
        label: ['', Validators.required],
        isCorrect: [false]
      })
    );
  }

  createQuiz() {
    const passingScore = this.quizForm.value.passingScore;

    this.quizService.createQuiz(this.evaluationId, passingScore)
      .subscribe(res => {
        this.quiz = res;
        alert('Quiz Created');
      });
  }

  saveQuestions() {
    if (!this.quiz) return;

    let questionsProcessed = 0;
    const totalQuestions = this.questions.length;
    let choicesLeft = 0;

    // Count total choices to know when we're done
    this.questions.controls.forEach((qControl) => {
      choicesLeft += qControl.value.choices.length;
    });

    this.questions.controls.forEach((qControl) => {

      this.quizService.addQuestion(
        this.quiz.id,
        qControl.value.text,
        qControl.value.points
      ).subscribe(questionRes => {

        const choices = qControl.value.choices;

        choices.forEach((c: any) => {
          this.quizService.addChoice(
            questionRes.id,
            c.label,
            c.isCorrect
          ).subscribe(() => {
            choicesLeft--;
            // When all choices are saved, redirect to quiz play
            if (choicesLeft === 0) {
              alert('Questions Saved! Redirecting to quiz preview...');
              // Redirect to quiz-play component
              this.router.navigate([`/formateur/evaluations/${this.evaluationId}/quiz-play/${this.quiz.id}`]);
            }
          });
        });

      });

    });

    // If no choices, redirect immediately
    if (choicesLeft === 0) {
      alert('Questions Saved! Redirecting to quiz preview...');
      this.router.navigate([`/formateur/evaluations/${this.evaluationId}/quiz-play/${this.quiz.id}`]);
    }
  }
}
