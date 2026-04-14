import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DashboardService, DashboardStats, CompetitionFilter } from './dashboard.service';
import { environment } from '../../../environments/environment';

describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.competitionsApiUrl}/dashboard`;

  const mockStats: DashboardStats = {
    totalCompetitions: 10,
    activeCompetitions: 3,
    completedCompetitions: 5,
    totalParticipants: 150,
    totalTeams: 20,
    totalMessages: 500,
    totalNotifications: 80,
    participationRate: 75.5,
    totalRegistrations: 200,
    competitionsByType: { ONLINE: 6, PHYSICAL: 3, HYBRID: 1 },
    competitionsByStatus: { OPEN: 3, CLOSED: 2, COMPLETED: 5 },
    monthlyStats: [
      { month: 'Janvier', competitions: 2, participants: 30, messages: 100 },
      { month: 'Février', competitions: 3, participants: 45, messages: 150 }
    ],
    topCompetitions: [
      {
        competitionId: 39,
        title: 'Hackathon 2026',
        type: 'ONLINE',
        status: 'COMPLETED',
        participantCount: 50,
        teamCount: 10,
        messageCount: 200,
        maxParticipants: 60,
        fillRate: 83.3
      }
    ],
    messageStats: [
      { competitionId: 39, competitionTitle: 'Hackathon 2026', messageCount: 200, uniqueParticipants: 45 }
    ]
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DashboardService]
    });
    service = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ===== GET DASHBOARD STATS =====

  it('getDashboardStats() should call GET and return stats', () => {
    service.getDashboardStats().subscribe(stats => {
      expect(stats.totalCompetitions).toBe(10);
      expect(stats.activeCompetitions).toBe(3);
      expect(stats.participationRate).toBe(75.5);
    });

    const req = httpMock.expectOne(`${apiUrl}/stats`);
    expect(req.request.method).toBe('GET');
    req.flush(mockStats);
  });

  it('getDashboardStats() should return competitions by type', () => {
    service.getDashboardStats().subscribe(stats => {
      expect(stats.competitionsByType['ONLINE']).toBe(6);
      expect(stats.competitionsByType['PHYSICAL']).toBe(3);
    });

    const req = httpMock.expectOne(`${apiUrl}/stats`);
    req.flush(mockStats);
  });

  it('getDashboardStats() should return monthly stats', () => {
    service.getDashboardStats().subscribe(stats => {
      expect(stats.monthlyStats.length).toBe(2);
      expect(stats.monthlyStats[0].month).toBe('Janvier');
      expect(stats.monthlyStats[1].participants).toBe(45);
    });

    const req = httpMock.expectOne(`${apiUrl}/stats`);
    req.flush(mockStats);
  });

  it('getDashboardStats() should return top competitions', () => {
    service.getDashboardStats().subscribe(stats => {
      expect(stats.topCompetitions.length).toBe(1);
      expect(stats.topCompetitions[0].title).toBe('Hackathon 2026');
      expect(stats.topCompetitions[0].fillRate).toBe(83.3);
    });

    const req = httpMock.expectOne(`${apiUrl}/stats`);
    req.flush(mockStats);
  });

  // ===== FILTER COMPETITIONS =====

  it('filterCompetitions() should call POST with filter body', () => {
    const filter: CompetitionFilter = {
      searchTerm: 'hackathon',
      type: 'ONLINE',
      status: 'OPEN',
      sortBy: 'startDate',
      sortDirection: 'ASC'
    };

    service.filterCompetitions(filter).subscribe(competitions => {
      expect(competitions.length).toBe(1);
    });

    const req = httpMock.expectOne(`${apiUrl}/competitions/filter`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(filter);
    req.flush([{ title: 'Hackathon 2026' }]);
  });

  it('filterCompetitions() should work with empty filter', () => {
    service.filterCompetitions({}).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/competitions/filter`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush([]);
  });

  it('filterCompetitions() should filter by date range', () => {
    const filter: CompetitionFilter = {
      startDateFrom: '2026-01-01',
      startDateTo: '2026-12-31'
    };

    service.filterCompetitions(filter).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/competitions/filter`);
    expect(req.request.body.startDateFrom).toBe('2026-01-01');
    expect(req.request.body.startDateTo).toBe('2026-12-31');
    req.flush([]);
  });

  it('filterCompetitions() should filter by participants range', () => {
    const filter: CompetitionFilter = {
      minParticipants: 10,
      maxParticipants: 100
    };

    service.filterCompetitions(filter).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/competitions/filter`);
    expect(req.request.body.minParticipants).toBe(10);
    expect(req.request.body.maxParticipants).toBe(100);
    req.flush([]);
  });

  // ===== SEARCH COMPETITIONS =====

  it('searchCompetitions() should call GET with search term', () => {
    service.searchCompetitions('hackathon').subscribe(results => {
      expect(results.length).toBe(2);
    });

    const req = httpMock.expectOne(r => r.url === `${apiUrl}/competitions/search`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('q')).toBe('hackathon');
    req.flush([{ title: 'Hackathon 2026' }, { title: 'Hackathon Junior' }]);
  });

  it('searchCompetitions() should return empty array when no results', () => {
    service.searchCompetitions('xyz').subscribe(results => {
      expect(results.length).toBe(0);
    });

    const req = httpMock.expectOne(r => r.url === `${apiUrl}/competitions/search`);
    req.flush([]);
  });

  it('searchCompetitions() should handle special characters in search', () => {
    service.searchCompetitions('spring boot').subscribe();

    const req = httpMock.expectOne(r => r.url === `${apiUrl}/competitions/search`);
    expect(req.request.params.get('q')).toBe('spring boot');
    req.flush([]);
  });
});
