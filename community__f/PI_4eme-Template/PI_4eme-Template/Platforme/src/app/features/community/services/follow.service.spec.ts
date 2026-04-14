import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FollowService } from './follow.service';

describe('FollowService', () => {
  let service: FollowService;
  let http: HttpTestingController;
  const base = 'http://localhost:8081/api/community';

  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ idUser: 1 }));

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FollowService]
    });

    service = TestBed.inject(FollowService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('followUser sends POST to /users/:id/follow', () => {
    service.followUser(9).subscribe();

    const req = http.expectOne(`${base}/users/9/follow`);
    expect(req.request.method).toBe('POST');
    req.flush(null);
  });

  it('unfollowUser sends DELETE to /users/:id/unfollow', () => {
    service.unfollowUser(9).subscribe();

    const req = http.expectOne(`${base}/users/9/unfollow`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('getFollowStatus returns true when isFollowing is true', () => {
    service.getFollowStatus(5).subscribe(status => {
      expect(status).toBeTrue();
    });

    const req = http.expectOne(`${base}/users/5/follow-status`);
    req.flush({ isFollowing: true });
  });

  it('getFollowStatus returns false when isFollowing is false', () => {
    service.getFollowStatus(5).subscribe(status => {
      expect(status).toBeFalse();
    });

    const req = http.expectOne(`${base}/users/5/follow-status`);
    req.flush({ isFollowing: false });
  });

  it('getFollowStatus handles boolean response directly', () => {
    service.getFollowStatus(5).subscribe(status => {
      expect(status).toBeTrue();
    });

    const req = http.expectOne(`${base}/users/5/follow-status`);
    req.flush(true);
  });

  it('getFollowStatus returns false when response has no known field', () => {
    service.getFollowStatus(5).subscribe(status => {
      expect(status).toBeFalse();
    });

    const req = http.expectOne(`${base}/users/5/follow-status`);
    req.flush({});
  });

  it('getFollowers sends GET to /follows/followers/:id and maps response', () => {
    service.getFollowers(3).subscribe(followers => {
      expect(followers.length).toBe(2);
      expect(followers[0].followerId).toBe(10);
      expect(followers[0].followingId).toBe(3);
    });

    const req = http.expectOne(`${base}/follows/followers/3`);
    expect(req.request.method).toBe('GET');
    req.flush([
      { followId: 1, followerId: 10, followingId: 3 },
      { followId: 2, followerId: 11, followingId: 3 }
    ]);
  });

  it('getFollowing sends GET to /follows/following/:id and maps response', () => {
    service.getFollowing(1).subscribe(following => {
      expect(following.length).toBe(1);
      expect(following[0].followingId).toBe(7);
    });

    const req = http.expectOne(`${base}/follows/following/1`);
    req.flush([{ followId: 3, followerId: 1, followingId: 7 }]);
  });

  it('countFollowers sends GET to /follows/followers/:id/count', () => {
    service.countFollowers(2).subscribe(count => {
      expect(count).toBe(42);
    });

    const req = http.expectOne(`${base}/follows/followers/2/count`);
    req.flush(42);
  });

  it('countFollowing sends GET to /follows/following/:id/count', () => {
    service.countFollowing(2).subscribe(count => {
      expect(count).toBe(15);
    });

    const req = http.expectOne(`${base}/follows/following/2/count`);
    req.flush(15);
  });

  it('getCurrentUserIdSafe returns null when no token', () => {
    localStorage.clear();
    const id = service.getCurrentUserIdSafe();
    expect(id).toBeNull();
  });

  it('getCurrentUserIdSafe returns userId from localStorage', () => {
    const id = service.getCurrentUserIdSafe();
    expect(id).toBe(1);
  });
});
