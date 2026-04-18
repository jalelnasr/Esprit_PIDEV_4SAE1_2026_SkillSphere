import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CompetitionApiService } from './competition-api.service';
import { environment } from '../../../../environments/environment';

describe('CompetitionApiService', () => {
  let service: CompetitionApiService;
  let httpMock: HttpTestingController;
  const base = environment.competitionsApiUrl;

  const mockCompetition = {
    competitionId: 1,
    title: 'Hackathon 2026',
    status: 'OPEN',
    participationType: 'INDIVIDUAL',
    maxParticipants: 20,
    createdBy: 8
  };

  const mockParticipant = {
    id: 1,
    userId: 11,
    competitionId: 1,
    status: 'REGISTERED'
  };

  const mockTeam = {
    teamId: 1,
    teamName: 'Team Alpha',
    competitionId: 1
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CompetitionApiService]
    });
    service = TestBed.inject(CompetitionApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ===== GET ALL COMPETITIONS =====
  it('should get all competitions', () => {
    service.getAllCompetitions().subscribe(competitions => {
      expect(competitions.length).toBe(1);
      expect(competitions[0].title).toBe('Hackathon 2026');
    });

    const req = httpMock.expectOne(`${base}/competitions`);
    expect(req.request.method).toBe('GET');
    req.flush([mockCompetition]);
  });

  // ===== GET BY ID =====
  it('should get competition by id', () => {
    service.getCompetitionById(1).subscribe(competition => {
      expect(competition.competitionId).toBe(1);
      expect(competition.title).toBe('Hackathon 2026');
    });

    const req = httpMock.expectOne(`${base}/competitions/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockCompetition);
  });

  // ===== CREATE =====
  it('should create a competition', () => {
    const newComp = { title: 'New Hackathon', type: 'ONLINE', participationType: 'INDIVIDUAL', status: 'OPEN' };

    service.createCompetition(newComp as any).subscribe(competition => {
      expect(competition.title).toBe('Hackathon 2026');
    });

    const req = httpMock.expectOne(`${base}/competitions`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newComp);
    req.flush(mockCompetition);
  });

  // ===== UPDATE =====
  it('should update a competition', () => {
    const update = { title: 'Updated Title', status: 'CLOSED' };

    service.updateCompetition(1, update as any).subscribe(competition => {
      expect(competition).toBeTruthy();
    });

    const req = httpMock.expectOne(`${base}/competitions/1`);
    expect(req.request.method).toBe('PUT');
    req.flush({ ...mockCompetition, ...update });
  });

  // ===== DELETE =====
  it('should delete a competition', () => {
    service.deleteCompetition(1).subscribe({
      complete: () => expect(true).toBeTrue()
    });

    const req = httpMock.expectOne(`${base}/competitions/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  // ===== UPDATE STATUS =====
  it('should update competition status', () => {
    service.updateCompetitionStatus(1, 'CLOSED').subscribe(competition => {
      expect(competition).toBeTruthy();
    });

    const req = httpMock.expectOne(r => r.url === `${base}/competitions/1/status`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.params.get('status')).toBe('CLOSED');
    req.flush({ ...mockCompetition, status: 'CLOSED' });
  });

  // ===== REGISTER =====
  it('should register individual participant', () => {
    service.registerIndividual(1).subscribe(participant => {
      expect(participant.userId).toBe(11);
    });

    const req = httpMock.expectOne(`${base}/competitions/1/register`);
    expect(req.request.method).toBe('POST');
    req.flush(mockParticipant);
  });

  // ===== CANCEL REGISTRATION =====
  it('should cancel registration', () => {
    service.cancelRegistration(1).subscribe({
      complete: () => expect(true).toBeTrue()
    });

    const req = httpMock.expectOne(`${base}/competitions/1/register`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  // ===== MY PARTICIPATIONS =====
  it('should get my participations', () => {
    service.getMyParticipations().subscribe(competitions => {
      expect(competitions.length).toBe(1);
    });

    const req = httpMock.expectOne(`${base}/competitions/my-participations`);
    expect(req.request.method).toBe('GET');
    req.flush([mockCompetition]);
  });

  // ===== MY CREATED =====
  it('should get my created competitions', () => {
    service.getMyCreatedCompetitions().subscribe(competitions => {
      expect(competitions.length).toBe(1);
    });

    const req = httpMock.expectOne(`${base}/competitions/my-created`);
    expect(req.request.method).toBe('GET');
    req.flush([mockCompetition]);
  });

  // ===== PARTICIPANTS =====
  it('should get participants of a competition', () => {
    service.getParticipants(1).subscribe(participants => {
      expect(participants.length).toBe(1);
      expect(participants[0].userId).toBe(11);
    });

    const req = httpMock.expectOne(`${base}/competitions/1/participants`);
    expect(req.request.method).toBe('GET');
    req.flush([mockParticipant]);
  });

  // ===== UPDATE SCORE =====
  it('should update participant score', () => {
    service.updateParticipantScore(1, 95, 1).subscribe(participant => {
      expect(participant).toBeTruthy();
    });

    const req = httpMock.expectOne(r => r.url === `${base}/competitions/participant/1/score`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.params.get('score')).toBe('95');
    expect(req.request.params.get('rank')).toBe('1');
    req.flush({ ...mockParticipant, score: 95, rank: 1 });
  });

  // ===== TEAMS =====
  it('should get teams by competition', () => {
    service.getTeamsByCompetition(1).subscribe(teams => {
      expect(teams.length).toBe(1);
      expect(teams[0].teamName).toBe('Team Alpha');
    });

    const req = httpMock.expectOne(`${base}/competitions/1/teams`);
    expect(req.request.method).toBe('GET');
    req.flush([mockTeam]);
  });

  it('should join a team', () => {
    service.joinTeam(1).subscribe(member => {
      expect(member).toBeTruthy();
    });

    const req = httpMock.expectOne(`${base}/competitions/teams/1/join`);
    expect(req.request.method).toBe('POST');
    req.flush({ id: 1, teamId: 1, userId: 11 });
  });

  it('should leave a team', () => {
    service.leaveTeam(1).subscribe({
      complete: () => expect(true).toBeTrue()
    });

    const req = httpMock.expectOne(`${base}/competitions/teams/1/leave`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  // ===== LEADERBOARD =====
  it('should get leaderboard', () => {
    service.getLeaderboard(1).subscribe(entries => {
      expect(entries).toBeTruthy();
    });

    const req = httpMock.expectOne(`${base}/leaderboards/1`);
    expect(req.request.method).toBe('GET');
    req.flush([{ userId: 11, score: 95, rank: 1 }]);
  });

  // ===== DRAW =====
  it('should perform draw', () => {
    service.performDraw(1).subscribe(result => {
      expect(result).toBeTruthy();
    });

    const req = httpMock.expectOne(`${base}/competitions/1/draw`);
    expect(req.request.method).toBe('POST');
    req.flush({ success: true });
  });

  it('should get matches', () => {
    service.getMatches(1).subscribe(matches => {
      expect(matches).toBeTruthy();
    });

    const req = httpMock.expectOne(`${base}/competitions/1/matches`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should declare match winner', () => {
    service.declareMatchWinner(1, 2).subscribe({
      complete: () => expect(true).toBeTrue()
    });

    const req = httpMock.expectOne(`${base}/competitions/matches/1/winner`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ winnerTeamId: 2 });
    req.flush(null);
  });

  // ===== SMS =====
  it('should send test SMS', () => {
    service.sendTestSms(11, 'Test message').subscribe(res => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne(`${base}/sms/send-test`);
    expect(req.request.method).toBe('POST');
    req.flush({ success: true });
  });

  it('should broadcast SMS to competition', () => {
    service.broadcastSmsToCompetition(1, 'Bonne chance!').subscribe(res => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne(`${base}/sms/competition/1/broadcast`);
    expect(req.request.method).toBe('POST');
    req.flush({ success: true });
  });
});
