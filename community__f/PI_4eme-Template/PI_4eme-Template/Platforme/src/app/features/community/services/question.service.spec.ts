import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { QuestionService } from './question.service';

describe('QuestionService', () => {
  let service: QuestionService;
  let http: HttpTestingController;
  const base = 'http://localhost:8081/api/community';

  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ idUser: 1 }));

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [QuestionService]
    });

    service = TestBed.inject(QuestionService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getQuestions returns mapped questions from array', () => {
    service.getQuestions().subscribe(questions => {
      expect(questions.length).toBe(2);
      expect(questions[0].id).toBe(1);
      expect(questions[0].title).toBe('How to use Angular?');
      expect(questions[0].user_id).toBe(5);
    });

    const req = http.expectOne(r => r.url === `${base}/questions`);
    expect(req.request.method).toBe('GET');
    req.flush([
      { questionId: 1, title: 'How to use Angular?', description: 'Desc', userId: 5 },
      { questionId: 2, title: 'What is Spring Boot?', description: 'Desc2', userId: 6 }
    ]);
  });

  it('createQuestion sends POST and maps response', () => {
    service.createQuestion({ title: 'New Q', description: 'Details' }).subscribe(q => {
      expect(q.id).toBe(10);
      expect(q.title).toBe('New Q');
    });

    const req = http.expectOne(`${base}/questions`);
    expect(req.request.method).toBe('POST');
    req.flush({ questionId: 10, title: 'New Q', description: 'Details', userId: 1 });
  });

  it('createQuestion unwraps nested question field', () => {
    service.createQuestion({ title: 'Wrapped', description: 'D' }).subscribe(q => {
      expect(q.id).toBe(11);
    });

    const req = http.expectOne(`${base}/questions`);
    req.flush({ question: { questionId: 11, title: 'Wrapped', description: 'D', userId: 1 } });
  });

  it('updateQuestion sends PUT to /questions/:id', () => {
    service.updateQuestion(5, { title: 'Updated', description: 'New desc' }).subscribe(q => {
      expect(q.id).toBe(5);
      expect(q.title).toBe('Updated');
    });

    const req = http.expectOne(`${base}/questions/5`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ title: 'Updated', description: 'New desc' });
    req.flush({ questionId: 5, title: 'Updated', description: 'New desc', userId: 1 });
  });

  it('deleteQuestion sends DELETE to /questions/:id', () => {
    service.deleteQuestion(3).subscribe();

    const req = http.expectOne(`${base}/questions/3`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('getQuestionsPage passes page and size as query params', () => {
    service.getQuestionsPage(2, 10).subscribe();

    const req = http.expectOne(r => r.url === `${base}/questions`);
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('size')).toBe('10');
    req.flush([]);
  });

  it('getQuestionsPage passes search param when provided', () => {
    service.getQuestionsPage(1, 5, { search: 'angular' }).subscribe();

    const req = http.expectOne(r => r.url === `${base}/questions`);
    expect(req.request.params.get('search')).toBe('angular');
    req.flush([]);
  });

  it('handles error on createQuestion', () => {
    let errorCaught = false;

    service.createQuestion({ title: 'x', description: 'y' }).subscribe({ error: () => { errorCaught = true; } });

    const req = http.expectOne(`${base}/questions`);
    req.flush('Error', { status: 500, statusText: 'Server Error' });

    expect(errorCaught).toBeTrue();
  });
});
