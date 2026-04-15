import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';

import { EvaluationCreateComponent } from './evaluation-create.component';
import { EvaluationApiService } from '../../../services/evaluation-api.service';
import { AuthService } from '../../../core/services/auth.service';

describe('EvaluationCreateComponent', () => {
  let component: EvaluationCreateComponent;
  let fixture: ComponentFixture<EvaluationCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluationCreateComponent],
      providers: [
        provideRouter([]),
        {
          provide: EvaluationApiService,
          useValue: {
            create: () => of({ id: 1 })
          }
        },
        {
          provide: AuthService,
          useValue: {
            currentUser$: of(null)
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvaluationCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
