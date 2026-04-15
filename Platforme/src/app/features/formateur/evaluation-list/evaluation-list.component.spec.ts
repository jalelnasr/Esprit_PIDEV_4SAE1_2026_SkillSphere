import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';

import { EvaluationListComponent } from './evaluation-list.component';
import { EvaluationApiService } from '../../../services/evaluation-api.service';
import { AuthService } from '../../../core/services/auth.service';

describe('EvaluationListComponent', () => {
  let component: EvaluationListComponent;
  let fixture: ComponentFixture<EvaluationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluationListComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({})
            }
          }
        },
        {
          provide: EvaluationApiService,
          useValue: {
            getByFormateur: () => of([]),
            searchEvaluations: () => of([])
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

    fixture = TestBed.createComponent(EvaluationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
