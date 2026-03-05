import {Component, OnInit} from '@angular/core';
import {FormBuilder, Validators, ReactiveFormsModule, FormGroup} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EvaluationApiService } from '../../../services/evaluation-api.service';

@Component({
  selector: 'app-evaluation-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './evaluation-create.component.html',
  styleUrls: ['./evaluation-create.component.css']
})
export class EvaluationCreateComponent implements OnInit {

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private evaluationService: EvaluationApiService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      title: ['', [Validators.required]],
      description: ['']
    });
  }

  submit() {
    if (this.form.invalid) return;

    const formateurId = 1; // TEMP (plus tard depuis auth)

    this.evaluationService.create({
      title: this.form.value.title,
      description: this.form.value.description,
      formateurId
    }).subscribe((created) => {

      // ✅ Redirect after create -> manage page
      this.router.navigate(['/formateur/evaluations', created.id, 'manage']);
    });
  }
}
