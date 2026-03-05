
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import {Evaluation, EvaluationApiService} from '../../../services/evaluation-api.service';


@Component({
  selector: 'app-evaluation-manage',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './evaluation-manage.component.html',
  styleUrl: './evaluation-manage.component.css'
})
export class EvaluationManageComponent implements OnInit {



  evaluationId!: number;
  evaluation?: Evaluation;
  form!: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private evaluationService:  EvaluationApiService
  ) {}

  ngOnInit() {
    this.evaluationId = Number(this.route.snapshot.paramMap.get('id'));

    this.form = this.fb.group({
      title: ['', Validators.required],
      description: ['']
    });

    this.load();
  }

  load() {
    this.evaluationService.getById(this.evaluationId).subscribe(e => {
      this.evaluation = e;
      this.form.patchValue({
        title: e.title,
        description: e.description
      });
    });
  }

  save() {
    if (this.form.invalid) return;

    this.evaluationService.update(this.evaluationId, this.form.value)
      .subscribe(updated => {
        this.evaluation = updated;
        alert('Saved');
      });
  }

  publish() {
    this.evaluationService.publish(this.evaluationId)
      .subscribe(updated => {
        this.evaluation = updated;
        alert('Published');
      });
  }

  delete() {
    this.evaluationService.delete(this.evaluationId)
      .subscribe(() => {
        this.router.navigate(['/formateur/evaluations']);
      });
  }

  goToQuiz() {
    this.router.navigate(['/formateur/evaluations', this.evaluationId, 'quiz']);
  }
}
