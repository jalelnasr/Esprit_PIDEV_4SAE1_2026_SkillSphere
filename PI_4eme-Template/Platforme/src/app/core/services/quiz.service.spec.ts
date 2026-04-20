import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { QuizService, QuizData, QuizResult, QuizStats } from './quiz.service';
import { AuthService } from './auth.service';

describe('QuizService', () => {
  let service: QuizService;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const BASE = 'http://localhost:8087/formation-service/api/formation';

  const mockUser = { idUser: 1, role: 'STUDENT', email: 'test@test.com' };
  const mockToken = 'mock-jwt-token';

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser', 'getToken']);
    authServiceSpy.getCurrentUser.and.returnValue(mockUser as any);
    authServiceSpy.getToken.and.returnValue(mockToken);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        QuizService,
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });

    service = TestBed.inject(QuizService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ── hasQuiz ────────────────────────────────────────────────────────────────

  it('should check if lesson has a quiz', () => {
    service.hasQuiz(1).subscribe(res => {
      expect(res.hasQuiz).toBeTrue();
    });

    const req = httpMock.expectOne(`${BASE}/lessons/1/quiz/exists`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
    req.flush({ hasQuiz: true });
  });

  it('should return false when lesson has no quiz', () => {
    service.hasQuiz(5).subscribe(res => {
      expect(res.hasQuiz).toBeFalse();
    });

    const req = httpMock.expectOne(`${BASE}/lessons/5/quiz/exists`);
    req.flush({ hasQuiz: false });
  });

  // ── getQuiz ────────────────────────────────────────────────────────────────

  it('should get quiz for a lesson', () => {
    const mockQuiz: QuizData = {
      id: 1,
      lessonId: 1,
      title: 'Test Quiz',
      passThreshold: 70,
      isBlocking: false,
      questions: []
    };

    service.getQuiz(1).subscribe(quiz => {
      expect(quiz.id).toBe(1);
      expect(quiz.title).toBe('Test Quiz');
      expect(quiz.passThreshold).toBe(70);
    });

    const req = httpMock.expectOne(`${BASE}/lessons/1/quiz`);
    expect(req.request.method).toBe('GET');
    req.flush(mockQuiz);
  });

  // ── createQuiz ─────────────────────────────────────────────────────────────

  it('should create a quiz for a lesson', () => {
    const quizRequest = {
      title: 'New Quiz',
      passThreshold: 80,
      isBlocking: true,
      questions: [
        {
          text: 'What is Angular?',
          orderIndex: 0,
          options: [
            { text: 'A framework', isCorrect: true, orderIndex: 0 },
            { text: 'A library', isCorrect: false, orderIndex: 1 }
          ]
        }
      ]
    };

    const mockResponse: QuizData = { id: 1, lessonId: 1, ...quizRequest, questions: [] };

    service.createQuiz(1, quizRequest).subscribe(res => {
      expect(res.id).toBe(1);
    });

    const req = httpMock.expectOne(`${BASE}/lessons/1/quiz`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.title).toBe('New Quiz');
    req.flush(mockResponse);
  });

  // ── submitQuiz ─────────────────────────────────────────────────────────────

  it('should submit quiz answers and return result', () => {
    const submission = {
      enrollmentId: 1,
      answers: [{ questionId: 1, chosenOptionId: 10 }]
    };

    const mockResult: QuizResult = {
      score: 100,
      passed: true,
      passThreshold: 70,
      correctCount: 1,
      totalQuestions: 1,
      results: []
    };

    service.submitQuiz(1, submission).subscribe(result => {
      expect(result.score).toBe(100);
      expect(result.passed).toBeTrue();
    });

    const req = httpMock.expectOne(`${BASE}/quizzes/1/submit`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResult);
  });

  it('should indicate failure when score below threshold', () => {
    const submission = {
      enrollmentId: 1,
      answers: [{ questionId: 1, chosenOptionId: 11 }]
    };

    const mockResult: QuizResult = {
      score: 0,
      passed: false,
      passThreshold: 70,
      correctCount: 0,
      totalQuestions: 1,
      results: []
    };

    service.submitQuiz(1, submission).subscribe(result => {
      expect(result.passed).toBeFalse();
      expect(result.score).toBe(0);
    });

    const req = httpMock.expectOne(`${BASE}/quizzes/1/submit`);
    req.flush(mockResult);
  });

  // ── getStats ───────────────────────────────────────────────────────────────

  it('should get quiz statistics', () => {
    const mockStats: QuizStats = {
      averageScore: 75,
      totalAttempts: 20,
      passedCount: 15,
      passRate: 75
    };

    service.getStats(1).subscribe(stats => {
      expect(stats.averageScore).toBe(75);
      expect(stats.passRate).toBe(75);
      expect(stats.totalAttempts).toBe(20);
    });

    const req = httpMock.expectOne(`${BASE}/quizzes/1/stats`);
    expect(req.request.method).toBe('GET');
    req.flush(mockStats);
  });

  // ── deleteQuiz ─────────────────────────────────────────────────────────────

  it('should delete a quiz', () => {
    service.deleteQuiz(1).subscribe();

    const req = httpMock.expectOne(`${BASE}/quizzes/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  // ── getMyAttempt ───────────────────────────────────────────────────────────

  it('should get my last quiz attempt', () => {
    const mockAttempt = { score: 85, passed: true, attemptedAt: '2026-04-13T10:00:00' };

    service.getMyAttempt(1).subscribe(attempt => {
      expect(attempt.score).toBe(85);
      expect(attempt.passed).toBeTrue();
    });

    const req = httpMock.expectOne(`${BASE}/quizzes/1/my-attempt`);
    expect(req.request.method).toBe('GET');
    req.flush(mockAttempt);
  });

  // ── headers ───────────────────────────────────────────────────────────────

  it('should include JWT token in all requests', () => {
    service.getQuiz(1).subscribe();

    const req = httpMock.expectOne(`${BASE}/lessons/1/quiz`);
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
    expect(req.request.headers.get('X-User-Id')).toBe('1');
    expect(req.request.headers.get('X-User-Role')).toBe('STUDENT');
    req.flush({});
  });

  it('should get my quiz summary', () => {
    service.getMyQuizSummary().subscribe(summaries => {
      expect(summaries.length).toBe(1);
    });

    const req = httpMock.expectOne(`${BASE}/quizzes/my-summary`);
    expect(req.request.method).toBe('GET');
    req.flush([{ quizId: 1, status: 'PASSED' }]);
  });
});
