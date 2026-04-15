import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { Location } from '@angular/common';

import { DashboardComponent } from './dashboard.component';
import { AuthService } from '../../core/services/auth.service';
import { CourseService } from '../../core/services/course.service';
import { EvaluationApiService, Evaluation } from '../../services/evaluation-api.service';
import { QuizApiService } from '../../services/QuizService';
import { BackendRole, BackendUser } from '../../core/models/auth.model';

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let component: DashboardComponent;

  let userSubject: BehaviorSubject<BackendUser | null>;
  let roleSubject: BehaviorSubject<BackendRole | null>;

  let evaluationServiceSpy: jasmine.SpyObj<EvaluationApiService>;
  let quizServiceSpy: jasmine.SpyObj<QuizApiService>;
  let locationSpy: jasmine.SpyObj<Location>;

  function createUser(role: BackendRole, idUser = 7): BackendUser {
    return {
      idUser,
      nom: 'Ben',
      prenom: 'Zo',
      email: 'benzo@gmail.com',
      role
    };
  }

  beforeEach(async () => {
    userSubject = new BehaviorSubject<BackendUser | null>(null);
    roleSubject = new BehaviorSubject<BackendRole | null>(null);

    evaluationServiceSpy = jasmine.createSpyObj<EvaluationApiService>('EvaluationApiService', ['getByFormateur']);
    quizServiceSpy = jasmine.createSpyObj<QuizApiService>('QuizApiService', ['getQuiz']);
    locationSpy = jasmine.createSpyObj<Location>('Location', ['back']);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { currentUser$: userSubject.asObservable(), userRole$: roleSubject.asObservable() } },
        { provide: CourseService, useValue: {} },
        { provide: EvaluationApiService, useValue: evaluationServiceSpy },
        { provide: QuizApiService, useValue: quizServiceSpy },
        { provide: Location, useValue: locationSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('should not call evaluations API for non-FORMATEUR user', () => {
    userSubject.next(createUser('APPRENANT', 33));
    roleSubject.next('APPRENANT');

    fixture.detectChanges();

    expect(evaluationServiceSpy.getByFormateur).not.toHaveBeenCalled();
    expect(component.evaluations.length).toBe(0);
    expect(component.evaluationError).toBeNull();
  });

  it('should map 403 error to access denied message', () => {
    userSubject.next(createUser('FORMATEUR', 7));
    roleSubject.next('FORMATEUR');

    evaluationServiceSpy.getByFormateur.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 403, statusText: 'Forbidden' }))
    );

    fixture.detectChanges();

    expect(evaluationServiceSpy.getByFormateur).toHaveBeenCalledWith(7);
    expect(component.evaluationError).toBe('Access denied: this account cannot access these evaluations.');
    expect(component.evaluationLoading).toBeFalse();
    expect(component.evaluations).toEqual([]);
  });

  it('should load mock evaluations when API returns empty list', () => {
    userSubject.next(createUser('FORMATEUR', 7));
    roleSubject.next('FORMATEUR');

    evaluationServiceSpy.getByFormateur.and.returnValue(of([]));

    fixture.detectChanges();

    expect(component.evaluations.length).toBe(2);
    expect(component.stats[0].value).toBe(2);
    expect(component.evaluationLoading).toBeFalse();
  });

  it('should load remote quiz details and update total points', () => {
    const evaluations: Evaluation[] = [
      {
        id: 10,
        title: 'Eval 10',
        description: 'With remote quiz',
        status: 'PUBLISHED',
        formateurId: 7,
        quiz: { id: 99, passingScore: 70 }
      }
    ];

    userSubject.next(createUser('FORMATEUR', 7));
    roleSubject.next('FORMATEUR');

    evaluationServiceSpy.getByFormateur.and.returnValue(of(evaluations));
    quizServiceSpy.getQuiz.and.returnValue(of({
      id: 99,
      passingScore: 70,
      evaluationId: 10,
      questions: [
        {
          id: 1,
          text: 'Q1',
          points: 15,
          choices: [
            { id: 1, label: 'A', isCorrect: true }
          ]
        }
      ]
    }));

    fixture.detectChanges();

    expect(quizServiceSpy.getQuiz).toHaveBeenCalledWith(99);
    expect(component.getTotalPoints(component.evaluations[0])).toBe(15);
    expect(component.stats[3].value).toBe(15);
  });

  it('should call location.back on goBack()', () => {
    component.goBack();
    expect(locationSpy.back).toHaveBeenCalled();
  });
});
