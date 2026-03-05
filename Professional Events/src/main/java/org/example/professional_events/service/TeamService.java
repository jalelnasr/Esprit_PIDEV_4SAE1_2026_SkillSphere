package org.example.professional_events.service;

import org.example.professional_events.entity.Competition;
import org.example.professional_events.entity.Team;
import org.example.professional_events.entity.TeamMember;
import org.example.professional_events.repository.TeamRepository;
import org.example.professional_events.repository.TeamMemberRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;

    public TeamService(TeamRepository teamRepository, TeamMemberRepository teamMemberRepository) {
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
    }

    @Transactional
    public void createTeamsForCompetition(Competition competition) {
        Integer numberOfTeams = competition.getNumberOfTeams();
        Integer maxMembers = competition.getParticipantsPerTeam();

        if (numberOfTeams == null || numberOfTeams <= 0) return;
        if (maxMembers == null || maxMembers <= 0) return;

        for (int i = 1; i <= numberOfTeams; i++) {
            Team t = new Team();
            t.setCompetition(competition);
            t.setTeamName("Team " + i);
            t.setMaxMembers(maxMembers);
            t.setCurrentMembers(0);
            t.setCreationDate(LocalDateTime.now());
            t.setTeamLeaderId(competition.getCreatedBy());

            teamRepository.save(t);
        }
    }

    public List<Team> getTeamsWithMembers(Long competitionId) {
        return teamRepository.findByCompetition_CompetitionId(competitionId);
    }

    public List<TeamMember> getTeamMembers(Long teamId) {
        return teamMemberRepository.findByTeam_TeamId(teamId);
    }

    @Transactional
    public TeamMember joinTeam(Long teamId, Long userId, String userName) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        if (team.isFull()) {
            throw new RuntimeException("Team is full");
        }

        Optional<TeamMember> existingMember = teamMemberRepository
                .findByTeam_Competition_CompetitionIdAndUserId(team.getCompetition().getCompetitionId(), userId);

        if (existingMember.isPresent()) {
            throw new RuntimeException("Already in a team for this competition");
        }

        TeamMember member = new TeamMember();
        member.setTeam(team);
        member.setUserId(userId);
        member.setUserName(userName);
        member.setJoinedAt(LocalDateTime.now());

        team.setCurrentMembers(team.getCurrentMembers() + 1);
        teamRepository.save(team);

        return teamMemberRepository.save(member);
    }

    @Transactional
    public void leaveTeam(Long teamId, Long userId) {
        TeamMember member = teamMemberRepository.findByTeam_TeamIdAndUserId(teamId, userId)
                .orElseThrow(() -> new RuntimeException("Not a member of this team"));

        Team team = member.getTeam();
        team.setCurrentMembers(Math.max(0, team.getCurrentMembers() - 1));
        teamRepository.save(team);

        teamMemberRepository.delete(member);
    }

    public TeamMember getUserTeamForCompetition(Long competitionId, Long userId) {
        return teamMemberRepository.findByTeam_Competition_CompetitionIdAndUserId(competitionId, userId)
                .orElse(null);
    }

    @Transactional
    public void deleteTeamWithMembers(Long teamId) {
        List<TeamMember> members = teamMemberRepository.findByTeam_TeamId(teamId);
        teamMemberRepository.deleteAll(members);
        teamRepository.deleteById(teamId);
    }

    public List<Competition> getCompetitionsWhereUserIsInTeam(Long userId) {
        // Trouver toutes les équipes où l'utilisateur est membre
        List<TeamMember> memberships = teamMemberRepository.findByUserId(userId);
        
        // Extraire les compétitions uniques
        return memberships.stream()
            .map(member -> member.getTeam().getCompetition())
            .distinct()
            .collect(java.util.stream.Collectors.toList());
    }
}
