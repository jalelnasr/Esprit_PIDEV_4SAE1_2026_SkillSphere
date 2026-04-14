import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GroupService } from './group.service';

describe('GroupService', () => {
  let service: GroupService;
  let http: HttpTestingController;
  const base = 'http://localhost:8081/api/community';

  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ idUser: 1 }));

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GroupService]
    });

    service = TestBed.inject(GroupService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getGroups returns mapped groups from array response', () => {
    service.getGroups().subscribe(groups => {
      expect(groups.length).toBe(2);
      expect(groups[0].id).toBe(1);
      expect(groups[0].name).toBe('Dev');
    });

    const req = http.expectOne(r => r.url === `${base}/groups`);
    expect(req.request.method).toBe('GET');
    req.flush([
      { groupId: 1, name: 'Dev', description: 'Devs', createdBy: 5 },
      { groupId: 2, name: 'Design', description: 'Designers', createdBy: 3 }
    ]);
  });

  it('createGroup sends POST and maps response', () => {
    service.createGroup({ name: 'New Group', description: 'Desc' }).subscribe(group => {
      expect(group.id).toBe(10);
      expect(group.name).toBe('New Group');
      expect(group.created_by).toBe(1);
    });

    const req = http.expectOne(`${base}/groups`);
    expect(req.request.method).toBe('POST');
    req.flush({ groupId: 10, name: 'New Group', description: 'Desc', createdBy: 1 });
  });

  it('joinGroup sends POST to /groups/:id/join', () => {
    service.joinGroup(5).subscribe(res => {
      expect(res.groupId).toBe(5);
    });

    const req = http.expectOne(`${base}/groups/5/join`);
    expect(req.request.method).toBe('POST');
    req.flush({ groupId: 5, userId: 1, joined: true, role: 'membre' });
  });

  it('getGroupMembership returns true when joined', () => {
    service.getGroupMembership(3).subscribe(isMember => {
      expect(isMember).toBeTrue();
    });

    const req = http.expectOne(`${base}/groups/3/membership`);
    req.flush({ groupId: 3, joined: true, role: 'membre' });
  });

  it('getGroupMembership returns false when not joined', () => {
    service.getGroupMembership(3).subscribe(isMember => {
      expect(isMember).toBeFalse();
    });

    const req = http.expectOne(`${base}/groups/3/membership`);
    req.flush({ groupId: 3, joined: false });
  });

  it('getMemberships parses array response', () => {
    service.getMemberships().subscribe(memberships => {
      expect(memberships.length).toBe(2);
      expect(memberships[0].groupId).toBe(1);
      expect(memberships[0].role).toBe('admin');
    });

    const req = http.expectOne(`${base}/groups/memberships`);
    req.flush([
      { groupId: 1, role: 'admin', joinedAt: '2024-01-01' },
      { groupId: 2, role: 'membre', joinedAt: '2024-01-02' }
    ]);
  });

  it('getMemberships parses wrapped memberships response', () => {
    service.getMemberships().subscribe(memberships => {
      expect(memberships.length).toBe(1);
      expect(memberships[0].groupId).toBe(7);
    });

    const req = http.expectOne(`${base}/groups/memberships`);
    req.flush({ memberships: [{ groupId: 7, role: 'membre' }] });
  });

  it('getGroupPosts sends GET to /groups/:id/posts', () => {
    service.getGroupPosts(4).subscribe(posts => {
      expect(posts.length).toBe(1);
      expect(posts[0].group_id).toBe(4);
    });

    const req = http.expectOne(`${base}/groups/4/posts`);
    req.flush([{ postId: 1, content: 'Post', userId: 2, groupId: 4 }]);
  });

  it('deleteGroup sends DELETE to /groups/:id', () => {
    service.deleteGroup(8).subscribe();

    const req = http.expectOne(`${base}/groups/8`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('handles 401 error gracefully', () => {
    let errorCaught = false;

    service.getGroups().subscribe({ error: () => { errorCaught = true; } });

    const req = http.expectOne(r => r.url === `${base}/groups`);
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(errorCaught).toBeTrue();
  });
});
