import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Team, TeamMember } from '../../models/competition.model';

@Component({
  selector: 'app-team-selection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team-selection.component.html',
  styleUrls: ['./team-selection.component.css']
})
export class TeamSelectionComponent implements OnInit {
  @Input() teams: Team[] = [];
  @Input() currentUserId: number | null = null;
  @Input() userTeamId: number | null = null; // ID du groupe de l'utilisateur
  
  @Output() joinTeam = new EventEmitter<number>();
  @Output() leaveTeam = new EventEmitter<number>();

  constructor() {}

  ngOnInit(): void {}

  onJoinTeam(teamId: number): void {
    this.joinTeam.emit(teamId);
  }

  onLeaveTeam(teamId: number): void {
    this.leaveTeam.emit(teamId);
  }

  isUserInTeam(team: Team): boolean {
    return team.members.some(m => m.userId === this.currentUserId);
  }

  canJoinTeam(team: Team): boolean {
    // Peut rejoindre si:
    // - Le groupe n'est pas complet
    // - L'utilisateur n'est pas déjà dans un groupe
    return !team.isFull && this.userTeamId === null;
  }

  getProgressPercentage(team: Team): number {
    return (team.currentMembers / team.maxMembers) * 100;
  }

  getProgressClass(team: Team): string {
    const percentage = this.getProgressPercentage(team);
    if (percentage >= 100) return 'full';
    if (percentage >= 75) return 'almost-full';
    if (percentage >= 50) return 'half-full';
    return 'available';
  }
}
