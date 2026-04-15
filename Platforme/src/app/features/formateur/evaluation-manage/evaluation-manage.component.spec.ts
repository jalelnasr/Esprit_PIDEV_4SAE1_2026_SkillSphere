import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { EvaluationManageComponent } from './evaluation-manage.component';
import { EvaluationApiService } from '../../../services/evaluation-api.service';

describe('EvaluationManageComponent', () => {
  let component: EvaluationManageComponent;
  let fixture: ComponentFixture<EvaluationManageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluationManageComponent],
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
          provide: EvaluationApiService,
          useValue: {
            getById: () => of({ id: 1, title: 'E1', description: 'D1', status: 'DRAFT' }),
            update: () => of({ id: 1, title: 'E1', description: 'D1', status: 'DRAFT' }),
            publish: () => of({ id: 1, title: 'E1', description: 'D1', status: 'PUBLISHED' }),
            delete: () => of(void 0)
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvaluationManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
