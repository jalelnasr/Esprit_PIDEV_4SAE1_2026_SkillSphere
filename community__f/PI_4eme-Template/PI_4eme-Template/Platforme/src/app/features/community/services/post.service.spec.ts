import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PostService } from './post.service';

describe('PostService', () => {
  let service: PostService;
  let http: HttpTestingController;
  const base = 'http://localhost:8081/api/community';

  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ idUser: 1 }));

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PostService]
    });

    service = TestBed.inject(PostService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('createPost sends POST to /posts and maps response', () => {
    const backendPost = { postId: 10, content: 'Hello', userId: 1, imageUrl: null, videoUrl: null, createdAt: '2024-01-01' };

    service.createPost({ content: 'Hello', image_url: null, video_url: null, group_id: null }).subscribe(post => {
      expect(post.id).toBe(10);
      expect(post.content).toBe('Hello');
      expect(post.user_id).toBe(1);
    });

    const req = http.expectOne(`${base}/posts`);
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
    req.flush(backendPost);
  });

  it('createPost sends POST to /posts/group/:id when group_id is set', () => {
    const backendPost = { postId: 11, content: 'Group post', userId: 1, groupId: 5 };

    service.createPost({ content: 'Group post', image_url: null, video_url: null, group_id: 5 }).subscribe(post => {
      expect(post.group_id).toBe(5);
    });

    const req = http.expectOne(`${base}/posts/group/5`);
    expect(req.request.method).toBe('POST');
    req.flush(backendPost);
  });

  it('getFeedPosts returns mapped array from plain array response', () => {
    const backendPosts = [
      { postId: 1, content: 'A', userId: 2 },
      { postId: 2, content: 'B', userId: 3 }
    ];

    service.getFeedPosts().subscribe(posts => {
      expect(posts.length).toBe(2);
      expect(posts[0].id).toBe(1);
      expect(posts[1].id).toBe(2);
    });

    const req = http.expectOne(r => r.url === `${base}/posts`);
    req.flush(backendPosts);
  });

  it('getPostsByUser sends GET to /posts/user/:id', () => {
    service.getPostsByUser(7).subscribe(posts => {
      expect(posts.length).toBe(1);
      expect(posts[0].user_id).toBe(7);
    });

    const req = http.expectOne(`${base}/posts/user/7`);
    expect(req.request.method).toBe('GET');
    req.flush([{ postId: 3, content: 'X', userId: 7 }]);
  });

  it('getPostsByGroup sends GET to /posts/group/:id', () => {
    service.getPostsByGroup(4).subscribe(posts => {
      expect(posts.length).toBe(1);
    });

    const req = http.expectOne(`${base}/posts/group/4`);
    req.flush([{ postId: 5, content: 'Y', userId: 2, groupId: 4 }]);
  });

  it('updatePost sends PUT and maps updated fields', () => {
    const updated = { postId: 9, content: 'updated', imageUrl: 'img.png', videoUrl: null, userId: 1 };

    service.updatePost(9, { content: 'updated', image_url: 'img.png', video_url: null, group_id: null }).subscribe(post => {
      expect(post.content).toBe('updated');
      expect(post.image_url).toBe('img.png');
    });

    const req = http.expectOne(`${base}/posts/9`);
    expect(req.request.method).toBe('PUT');
    req.flush(updated);
  });

  it('deletePost sends DELETE to /posts/:id', () => {
    service.deletePost(3).subscribe();

    const req = http.expectOne(`${base}/posts/3`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('likePost sends POST to /post-likes/:id', () => {
    service.likePost(5).subscribe();

    const req = http.expectOne(`${base}/post-likes/5`);
    expect(req.request.method).toBe('POST');
    req.flush(null);
  });

  it('unlikePost sends DELETE to /post-likes/:id', () => {
    service.unlikePost(5).subscribe();

    const req = http.expectOne(`${base}/post-likes/5`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('getPostLikeUserIds extracts userIds from response', () => {
    service.getPostLikeUserIds(2).subscribe(ids => {
      expect(ids).toEqual([10, 11]);
    });

    const req = http.expectOne(`${base}/post-likes/post/2`);
    req.flush([{ postLikeId: 1, userId: 10 }, { postLikeId: 2, userId: 11 }]);
  });

  it('sanitizes blob: URLs to null', () => {
    service.getFeedPosts().subscribe(posts => {
      expect(posts[0].image_url).toBeNull();
    });

    const req = http.expectOne(r => r.url === `${base}/posts`);
    req.flush([{ postId: 1, content: 'A', userId: 1, imageUrl: 'blob:http://localhost/abc' }]);
  });

  it('handles error and returns observable error', () => {
    let errorCaught = false;

    service.getFeedPosts().subscribe({
      error: () => { errorCaught = true; }
    });

    const req = http.expectOne(r => r.url === `${base}/posts`);
    req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

    expect(errorCaught).toBeTrue();
  });
});
