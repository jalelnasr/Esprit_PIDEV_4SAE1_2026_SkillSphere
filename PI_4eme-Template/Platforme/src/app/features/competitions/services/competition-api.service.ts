import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Competition,
  CreateCompetitionRequest,
  Participant,
  Team,
  LeaderboardEntry,
  Award
} from '../models/competition.model';

export interface TeamMemberDTO {
  id: number;
  teamId: number;
  teamName: string;
  userId: number;
  userName: string;
  joinedAt: string;
}

@Injectable({ providedIn: 'root' })
export class CompetitionApiService {
  private readonly baseUrl = environment.competitionsApiUrl; // "http://localhost:8087/api"

  constructor(private http: HttpClient) {}

  // ========== competitions ==========
  getAllCompetitions(): Observable<Competition[]> {
    return this.http.get<Competition[]>(`${this.baseUrl}/competitions`);
  }

  getCompetitionById(id: number): Observable<Competition> {
    return this.http.get<Competition>(`${this.baseUrl}/competitions/${id}`);
  }

  createCompetition(request: CreateCompetitionRequest): Observable<Competition> {
    return this.http.post<Competition>(`${this.baseUrl}/competitions`, request);
  }

  // ✅ backend maintenant supporte PUT /competitions/{id}
  updateCompetition(id: number, request: Partial<CreateCompetitionRequest>): Observable<Competition> {
    return this.http.put<Competition>(`${this.baseUrl}/competitions/${id}`, request);
  }

  deleteCompetition(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/competitions/${id}`);
  }

  updateCompetitionStatus(id: number, status: string): Observable<Competition> {
    const params = new HttpParams().set('status', status);
    return this.http.put<Competition>(`${this.baseUrl}/competitions/${id}/status`, null, { params });
  }

  // ========== participants (JWT) ==========
  // ✅ aligné au backend: POST /competitions/{competitionId}/register
  registerIndividual(competitionId: number): Observable<Participant> {
    return this.http.post<Participant>(`${this.baseUrl}/competitions/${competitionId}/register`, {});
  }

  // ✅ aligné au backend: DELETE /competitions/{competitionId}/register
  cancelRegistration(competitionId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/competitions/${competitionId}/register`);
  }

  // ✅ aligné au backend: GET /competitions/my-participations
  getMyParticipations(): Observable<Competition[]> {
    return this.http.get<Competition[]>(`${this.baseUrl}/competitions/my-participations`);
  }

  // ✅ GET /competitions/my-created - Compétitions créées par le formateur
  getMyCreatedCompetitions(): Observable<Competition[]> {
    return this.http.get<Competition[]>(`${this.baseUrl}/competitions/my-created`);
  }

  // ✅ GET /competitions/{id}/my-registration - Vérifier mon inscription
  getMyRegistration(competitionId: number): Observable<Participant> {
    return this.http.get<Participant>(`${this.baseUrl}/competitions/${competitionId}/my-registration`);
  }

  // ✅ aligné au backend: GET /competitions/{competitionId}/participants
  getParticipants(competitionId: number): Observable<Participant[]> {
    return this.http.get<Participant[]>(`${this.baseUrl}/competitions/${competitionId}/participants`);
  }

  // ✅ aligné au backend: PUT /competitions/participant/{registrationId}/score
  updateParticipantScore(registrationId: number, score: number, rank: number): Observable<Participant> {
    const params = new HttpParams()
      .set('score', score.toString())
      .set('rank', rank.toString());

    return this.http.put<Participant>(`${this.baseUrl}/competitions/participant/${registrationId}/score`, null, { params });
  }

  // ========== teams ==========
  getTeamsByCompetition(competitionId: number): Observable<Team[]> {
    return this.http.get<Team[]>(`${this.baseUrl}/competitions/${competitionId}/teams`);
  }

  joinTeam(teamId: number): Observable<TeamMemberDTO> {
    return this.http.post<TeamMemberDTO>(`${this.baseUrl}/competitions/teams/${teamId}/join`, {});
  }

  leaveTeam(teamId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/competitions/teams/${teamId}/leave`);
  }

  getMyTeam(competitionId: number): Observable<TeamMemberDTO> {
    return this.http.get<TeamMemberDTO>(`${this.baseUrl}/competitions/${competitionId}/my-team`);
  }

  // optionnels
  getLeaderboard(competitionId: number): Observable<LeaderboardEntry[]> {
    return this.http.get<LeaderboardEntry[]>(`${this.baseUrl}/leaderboards/${competitionId}`);
  }

  getMyAwards(): Observable<Award[]> {
    return this.http.get<Award[]>(`${this.baseUrl}/awards/my-awards`);
  }

  getAwardsByCompetition(competitionId: number): Observable<Award[]> {
    return this.http.get<Award[]>(`${this.baseUrl}/awards/competition/${competitionId}`);
  }

  // ========== NEW: Draw & Qualification Endpoints ==========
  
  /**
   * Qualifier/Déqualifier une équipe
   * PUT /api/competitions/teams/{teamId}/qualify
   */
  toggleTeamQualification(teamId: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/competitions/teams/${teamId}/qualify`, {});
  }

  /**
   * Effectuer le tirage au sort
   * POST /api/competitions/{competitionId}/draw
   */
  performDraw(competitionId: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/competitions/${competitionId}/draw`, {});
  }

  /**
   * Récupérer les matchs d'une compétition
   * GET /api/competitions/{competitionId}/matches
   */
  getMatches(competitionId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/competitions/${competitionId}/matches`);
  }

  /**
   * Déclarer le gagnant d'un match
   * PUT /api/competitions/matches/{matchId}/winner
   */
  declareMatchWinner(matchId: number, winnerTeamId: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/competitions/matches/${matchId}/winner`, { winnerTeamId });
  }

  /**
   * Déclarer le gagnant final de la compétition
   * PUT /api/competitions/{competitionId}/winner
   */
  declareFinalWinner(competitionId: number, winnerTeamId: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/competitions/${competitionId}/winner`, { winnerTeamId });
  }

  /**
   * Récupérer l'historique des tirages
   * GET /api/competitions/{competitionId}/draw-history
   */
  getDrawHistory(competitionId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/competitions/${competitionId}/draw-history`);
  }

  // ========== SMS Endpoints ==========

  /**
   * Envoyer un SMS de test
   * POST /api/sms/send-test
   */
  sendTestSms(userId: number, message: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/sms/send-test`, { userId: userId.toString(), message });
  }

  /**
   * Obtenir les statistiques SMS
   * GET /api/sms/statistics
   */
  getSmsStatistics(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/sms/statistics`);
  }

  /**
   * Obtenir l'historique SMS d'un utilisateur
   * GET /api/sms/user/{userId}/history
   */
  getUserSmsHistory(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/sms/user/${userId}/history`);
  }

  /**
   * Mettre à jour les préférences de contact
   * PUT /api/sms/user/{userId}/contact
   */
  updateUserContact(userId: number, phoneNumber: string, smsEnabled: boolean): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/sms/user/${userId}/contact`, {
      phoneNumber,
      smsNotificationsEnabled: smsEnabled
    });
  }

  /**
   * Obtenir les préférences de contact
   * GET /api/sms/user/{userId}/contact
   */
  getUserContact(userId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/sms/user/${userId}/contact`);
  }

  /**
   * Obtenir l'historique SMS d'une compétition
   * GET /api/sms/competition/{competitionId}/history
   */
  getCompetitionSmsHistory(competitionId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/sms/competition/${competitionId}/history`);
  }

  /**
   * Envoyer un SMS à tous les participants d'une compétition
   * POST /api/sms/competition/{competitionId}/broadcast
   */
  broadcastSmsToCompetition(competitionId: number, message: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/sms/competition/${competitionId}/broadcast`, { message });
  }

  // Envoyer SMS direct à un numéro (félicitations)
  sendSmsToPhone(phoneNumber: string, message: string, teamId?: number, competitionId?: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/sms/send-direct`, {
      phoneNumber,
      message,
      teamId,
      competitionId
    });
  }

  /**
   * Obtenir les membres de l'équipe gagnante avec leurs contacts
   * GET /api/competitions/{competitionId}/winner-team-members
   */
  getWinnerTeamMembers(competitionId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/competitions/${competitionId}/winner-team-members`);
  }

  // ========== STREAM Endpoints ==========

  /**
   * Créer ou mettre à jour un stream pour une compétition
   * POST /api/stream/competition/{competitionId}
   */
  createOrUpdateStream(competitionId: number, streamUrl: string, title?: string, autoExpireHours?: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/stream/competition/${competitionId}`, {
      streamUrl,
      title,
      autoExpireHours
    });
  }

  /**
   * Récupérer le stream d'une compétition
   * GET /api/stream/competition/{competitionId}
   */
  getStream(competitionId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/stream/competition/${competitionId}`);
  }

  /**
   * Démarrer le stream (OFFLINE → LIVE)
   * PUT /api/stream/competition/{competitionId}/start
   */
  startStream(competitionId: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/stream/competition/${competitionId}/start`, {});
  }

  /**
   * Arrêter le stream (LIVE → OFFLINE)
   * PUT /api/stream/competition/{competitionId}/stop
   */
  stopStream(competitionId: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/stream/competition/${competitionId}/stop`, {});
  }

  /**
   * Supprimer le stream
   * DELETE /api/stream/competition/{competitionId}
   */
  deleteStream(competitionId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/stream/competition/${competitionId}`);
  }
}
