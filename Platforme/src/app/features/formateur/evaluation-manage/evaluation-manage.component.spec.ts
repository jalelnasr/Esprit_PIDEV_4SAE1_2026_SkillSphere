import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationManageComponent } from './evaluation-manage.component';

describe('EvaluationManageComponent', () => {
  let component: EvaluationManageComponent;
  let fixture: ComponentFixture<EvaluationManageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluationManageComponent]
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
