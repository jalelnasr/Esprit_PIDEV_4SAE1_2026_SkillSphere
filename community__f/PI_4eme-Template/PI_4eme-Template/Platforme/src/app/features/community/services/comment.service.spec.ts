import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CommentService } from './comment.service';

describe('CommentService', () => {
  let service: CommentService;
  let http: HttpTestingController;
  const base = 'http://localhost:8081/api/community';

  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ idUser: 1 }));

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CommentService]
    });

    service = TestBed.inject(CommentService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('addComment sends POST to /comments/:postId and maps response', () => {
    service.addComment({ post_id: 5, content: 'Nice post!' }).subscribe(comment => {
      expect(comment.id).toBe(20);
      expect(comment.content).toBe('Nice post!');
      expect(comment.post_id).toBe(5);
      expect(comment.user_id).toBe(1);
    });

    const req = http.expectOne(`${base}/comments/5`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ content: 'Nice post!' });
    req.flush({ commentId: 20, content: 'Nice post!', userId: 1, post: { postId: 5 } });
  });

  it('addComment uses fallback postId when post is missing in response', () => {
    service.addComment({ post_id: 7, content: 'Test' }).subscribe(comment => {
      expect(comment.post_id).toBe(7);
    });

    const req = http.expectOne(`${base}/comments/7`);
    req.flush({ commentId: 21, content: 'Test', userId: 1 });
  });

  it('getCommentsByPost sends GET to /comments/post/:id', () => {
    service.getCommentsByPost(3).subscribe(comments => {
      expect(comments.length).toBe(2);
      expect(comments[0].post_id).toBe(3);
    });

    const req = http.expectOne(`${base}/comments/post/3`);
    expect(req.request.method).toBe('GET');
    req.flush([
      { commentId: 1, content: 'A', userId: 2, post: { postId: 3 } },
      { commentId: 2, content: 'B', userId: 3, post: { postId: 3 } }
    ]);
  });

  it('getCommentsByPost handles wrapped data response', () => {
    service.getCommentsByPost(3).subscribe(comments => {
      expect(comments.length).toBe(1);
    });

    const req = http.expectOne(`${base}/comments/post/3`);
    req.flush({ data: [{ commentId: 5, content: 'C', userId: 4, post: { postId: 3 } }] });
  });

  it('likeComment sends POST to /comment-likes/:id', () => {
    service.likeComment(10).subscribe();

    const req = http.expectOne(`${base}/comment-likes/10`);
    expect(req.request.method).toBe('POST');
    req.flush(null);
  });

  it('unlikeComment sends DELETE to /comment-likes/:id', () => {
    service.unlikeComment(10).subscribe();

    const req = http.expectOne(`${base}/comment-likes/10`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('getCommentLikeUserIds extracts userIds', () => {
    service.getCommentLikeUserIds(8).subscribe(ids => {
      expect(ids).toEqual([3, 5]);
    });

    const req = http.expectOne(`${base}/comment-likes/comment/8`);
    req.flush([{ commentLikeId: 1, userId: 3 }, { commentLikeId: 2, userId: 5 }]);
  });

  it('handles error on addComment', () => {
    let errorCaught = false;

    service.addComment({ post_id: 1, content: 'x' }).subscribe({ error: () => { errorCaught = true; } });

    const req = http.expectOne(`${base}/comments/1`);
    req.flush('Error', { status: 403, statusText: 'Forbidden' });

    expect(errorCaught).toBeTrue();
  });
});
