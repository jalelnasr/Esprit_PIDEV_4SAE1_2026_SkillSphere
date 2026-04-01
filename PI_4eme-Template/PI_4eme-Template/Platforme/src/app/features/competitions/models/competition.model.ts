export type CompetitionType = 'ONLINE' | 'PHYSICAL' | 'HYBRID';
export type CompetitionStatus = 'OPEN' | 'CLOSED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type ParticipationType = 'INDIVIDUAL' | 'TEAM' | 'BOTH';
export type ParticipantStatus = 'REGISTERED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
export type AwardType = 'GOLD' | 'SILVER' | 'BRONZE' | 'PARTICIPATION';

export interface Competition {
  competitionId: number;
  title: string;
  description: string;
  type: CompetitionType;
  participationType: ParticipationType;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  status: CompetitionStatus;
  numberOfTeams?: number;
  participantsPerTeam?: number;
  minTeamSize?: number;
  maxTeamSize?: number;
  createdBy?: number;
  createdAt?: string;
  updatedAt?: string;
  // Location fields
  locationName?: string;
  locationAddress?: string;
  latitude?: number;
  longitude?: number;
}

export interface CreateCompetitionRequest {
  title: string;
  description: string;
  type: CompetitionType;
  participationType: ParticipationType;
  startDate?: string;
  endDate?: string;
  maxParticipants: number;
  status: CompetitionStatus;
  numberOfTeams?: number;
  participantsPerTeam?: number;
  minTeamSize?: number;
  maxTeamSize?: number;
  // Location fields
  locationName?: string;
  locationAddress?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface Participant {
  registrationId: number;
  userId: number;
  competitionId: number;
  registrationDate: string;
  status: ParticipantStatus;
  score?: number;
  rank?: number;
  userName?: string;
  userEmail?: string;
}

export interface Team {
  teamId: number;
  competitionId: number;
  teamName: string;
  maxMembers: number;
  currentMembers: number;
  members?: TeamMember[];
}

export interface TeamMember {
  userId: number;
  userName: string;
  userEmail: string;
  joinedAt: string;
}

export interface CreateTeamRequest {
  competitionId: number;
  teamName: string;
  description?: string;
}

export interface LeaderboardEntry {
  leaderboardId: number;
  competitionId: number;
  userId?: number;
  teamId?: number;
  rank: number;
  score: number;
  lastUpdated: string;
  participantName?: string;
  teamMembers?: string[];
}

export interface Award {
  awardId: number;
  userId: number;
  competitionId: number;
  type: AwardType;
  description?: string;
  issueDate: string;
  badgeUrl?: string;
}
