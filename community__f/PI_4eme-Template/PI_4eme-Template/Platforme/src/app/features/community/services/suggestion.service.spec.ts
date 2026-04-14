import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SuggestionService } from './suggestion.service';

describe('SuggestionService', () => {
  let service: SuggestionService;
  let http: HttpTestingController;
  const base = 'http://localhost:8081/api/community';

  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ idUser: 1 }));

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SuggestionService]
    });

    service = TestBed.inject(SuggestionService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getSuggestedUsers sends GET to /suggestions/users and maps response', () => {
    service.getSuggestedUsers().subscribe(users => {
      expect(users.length).toBe(2);
      expect(users[0].user_id).toBe(5);
      expect(users[0].display_name).toBe('Alice');
      expect(users[0].score).toBe(7);
      expect(users[0].shared_groups).toBe(2);
      expect(users[0].same_domain).toBeTrue();
    });

    const req = http.expectOne(`${base}/suggestions/users`);
    expect(req.request.method).toBe('GET');
    req.flush([
      { userId: 5, displayName: 'Alice', score: 7, sharedGroups: 2, sharedHashtags: 1, sharedInteractions: 3, sameDomain: true },
      { userId: 6, displayName: 'Bob', score: 4, sharedGroups: 1, sharedHashtags: 0, sharedInteractions: 1, sameDomain: false }
    ]);
  });

  it('getSuggestedUsers respects limit parameter', () => {
    service.getSuggestedUsers(1).subscribe(users => {
      expect(users.length).toBe(1);
    });

    const req = http.expectOne(`${base}/suggestions/users`);
    req.flush([
      { userId: 5, displayName: 'Alice', score: 7, sharedGroups: 2, sharedHashtags: 1, sharedInteractions: 3, sameDomain: true },
      { userId: 6, displayName: 'Bob', score: 4, sharedGroups: 1, sharedHashtags: 0, sharedInteractions: 1, sameDomain: false }
    ]);
  });

  it('getSuggestedGroups sends GET to /suggestions/groups and maps response', () => {
    service.getSuggestedGroups().subscribe(groups => {
      expect(groups.length).toBe(1);
      expect(groups[0].id).toBe(10);
      expect(groups[0].name).toBe('Java Devs');
      expect(groups[0].trending).toBeTrue();
      expect(groups[0].popular).toBeFalse();
      expect(groups[0].members_count).toBe(50);
    });

    const req = http.expectOne(`${base}/suggestions/groups`);
    expect(req.request.method).toBe('GET');
    req.flush([
      { groupId: 10, name: 'Java Devs', description: 'Java group', score: 8, matchedHashtags: 3, overlapMembers: 5, recentActivity: 12, membersCount: 50, trending: true, popular: false }
    ]);
  });

  it('getSuggestedGroups handles wrapped data response', () => {
    service.getSuggestedGroups().subscribe(groups => {
      expect(groups.length).toBe(1);
      expect(groups[0].id).toBe(11);
    });

    const req = http.expectOne(`${base}/suggestions/groups`);
    req.flush({ data: [{ groupId: 11, name: 'Angular', description: 'Angular group', score: 5, matchedHashtags: 1, overlapMembers: 2, recentActivity: 3, membersCount: 20, trending: false, popular: true }] });
  });

  it('getSuggestedGroups respects limit parameter', () => {
    service.getSuggestedGroups(1).subscribe(groups => {
      expect(groups.length).toBe(1);
    });

    const req = http.expectOne(`${base}/suggestions/groups`);
    req.flush([
      { groupId: 1, name: 'G1', description: '', score: 5, matchedHashtags: 0, overlapMembers: 0, recentActivity: 0, membersCount: 10, trending: false, popular: false },
      { groupId: 2, name: 'G2', description: '', score: 3, matchedHashtags: 0, overlapMembers: 0, recentActivity: 0, membersCount: 5, trending: false, popular: false }
    ]);
  });

  it('handles error on getSuggestedUsers', () => {
    let errorCaught = false;

    service.getSuggestedUsers().subscribe({ error: () => { errorCaught = true; } });

    const req = http.expectOne(`${base}/suggestions/users`);
    req.flush('Error', { status: 500, statusText: 'Server Error' });

    expect(errorCaught).toBeTrue();
  });
});
