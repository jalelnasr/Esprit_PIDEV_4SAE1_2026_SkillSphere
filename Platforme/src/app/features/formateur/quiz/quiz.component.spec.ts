import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { QuizComponent } from './quiz.component';
import { QuizApiService } from '../../../services/QuizService';

describe('QuizComponent', () => {
  let component: QuizComponent;
  let fixture: ComponentFixture<QuizComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: '1' })
            }
          }
        },
        {
          provide: QuizApiService,
          useValue: {
            createQuiz: () => of({ id: 1, passingScore: 50, evaluationId: 1, questions: [] }),
            addQuestion: () => of({ id: 1, text: 'Q', points: 1, choices: [] }),
            addChoice: () => of({ id: 1, label: 'C', isCorrect: true })
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
