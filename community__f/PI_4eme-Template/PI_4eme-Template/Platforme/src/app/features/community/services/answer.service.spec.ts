import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AnswerService } from './answer.service';

describe('AnswerService', () => {
  let service: AnswerService;
  let http: HttpTestingController;
  const base = 'http://localhost:8081/api/community';

  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ idUser: 2 }));

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AnswerService]
    });

    service = TestBed.inject(AnswerService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('addAnswer sends POST to /answers/:questionId and maps response', () => {
    service.addAnswer({ question_id: 3, content: 'My answer' }).subscribe(answer => {
      expect(answer.id).toBe(15);
      expect(answer.content).toBe('My answer');
      expect(answer.question_id).toBe(3);
      expect(answer.user_id).toBe(2);
    });

    const req = http.expectOne(`${base}/answers/3`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ content: 'My answer' });
    req.flush({ answerId: 15, content: 'My answer', userId: 2, questionId: 3 });
  });

  it('addAnswer maps github_previews from response', () => {
    service.addAnswer({ question_id: 3, content: 'github.com/user/repo' }).subscribe(answer => {
      expect(answer.github_previews?.length).toBe(1);
      expect(answer.github_previews?.[0].repo_name).toBe('repo');
      expect(answer.github_previews?.[0].stars).toBe(100);
    });

    const req = http.expectOne(`${base}/answers/3`);
    req.flush({
      answerId: 16, content: 'github.com/user/repo', userId: 2, questionId: 3,
      githubPreviews: [{ repoName: 'repo', owner: 'user', description: 'A repo', language: 'Java', stars: 100, forks: 10, url: 'https://github.com/user/repo', status: 'OK' }]
    });
  });

  it('updateAnswer sends PUT to /answers/:id', () => {
    service.updateAnswer(5, { content: 'Updated answer' }, 3).subscribe(answer => {
      expect(answer.id).toBe(5);
      expect(answer.content).toBe('Updated answer');
    });

    const req = http.expectOne(`${base}/answers/5`);
    expect(req.request.method).toBe('PUT');
    req.flush({ answerId: 5, content: 'Updated answer', userId: 2, questionId: 3 });
  });

  it('deleteAnswer sends DELETE to /answers/:id', () => {
    service.deleteAnswer(7).subscribe();

    const req = http.expectOne(`${base}/answers/7`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('getAnswersByQuestion sends GET to /answers/question/:id', () => {
    service.getAnswersByQuestion(4).subscribe(answers => {
      expect(answers.length).toBe(2);
      expect(answers[0].question_id).toBe(4);
    });

    const req = http.expectOne(`${base}/answers/question/4`);
    req.flush([
      { answerId: 1, content: 'A1', userId: 2, questionId: 4 },
      { answerId: 2, content: 'A2', userId: 3, questionId: 4 }
    ]);
  });

  it('voteAnswer sends POST to /answer-votes/:id with voteType param', () => {
    service.voteAnswer(8, 'UP').subscribe();

    const req = http.expectOne(r => r.url === `${base}/answer-votes/8`);
    expect(req.request.method).toBe('POST');
    expect(req.request.params.get('voteType')).toBe('UP');
    req.flush(null);
  });

  it('removeVote sends DELETE to /answer-votes/:id', () => {
    service.removeVote(8).subscribe();

    const req = http.expectOne(`${base}/answer-votes/8`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('getAnswerVoteSummary counts upvotes and downvotes correctly', () => {
    service.getAnswerVoteSummary(9).subscribe(summary => {
      expect(summary.upvotes).toBe(2);
      expect(summary.downvotes).toBe(1);
      expect(summary.voteCount).toBe(1);
      expect(summary.userVote).toBe('UP');
    });

    const req = http.expectOne(`${base}/answer-votes/answer/9`);
    req.flush([
      { answerVoteId: 1, voteType: 'UP', userId: 2 },
      { answerVoteId: 2, voteType: 'UP', userId: 3 },
      { answerVoteId: 3, voteType: 'DOWN', userId: 4 }
    ]);
  });

  it('getAnswerVoteSummary sets userVote to null when current user has not voted', () => {
    service.getAnswerVoteSummary(9).subscribe(summary => {
      expect(summary.userVote).toBeNull();
    });

    const req = http.expectOne(`${base}/answer-votes/answer/9`);
    req.flush([{ answerVoteId: 1, voteType: 'UP', userId: 99 }]);
  });

  it('previewGitHub returns null for empty content without HTTP call', () => {
    service.previewGitHub('   ').subscribe(result => {
      expect(result).toBeNull();
    });

    http.expectNone(`${base}/answers/github-preview`);
  });

  it('previewGitHub sends GET with content param', () => {
    service.previewGitHub('github.com/user/repo').subscribe(preview => {
      expect(preview).not.toBeNull();
      expect(preview!.repo_name).toBe('repo');
      expect(preview!.status).toBe('OK');
    });

    const req = http.expectOne(r => r.url === `${base}/answers/github-preview`);
    expect(req.request.params.get('content')).toBe('github.com/user/repo');
    req.flush({ repoName: 'repo', owner: 'user', description: '', language: 'Java', stars: 5, forks: 1, url: 'https://github.com/user/repo', status: 'OK' });
  });

  it('handles error on addAnswer', () => {
    let errorCaught = false;

    service.addAnswer({ question_id: 1, content: 'x' }).subscribe({ error: () => { errorCaught = true; } });

    const req = http.expectOne(`${base}/answers/1`);
    req.flush('Error', { status: 500, statusText: 'Server Error' });

    expect(errorCaught).toBeTrue();
  });
});
