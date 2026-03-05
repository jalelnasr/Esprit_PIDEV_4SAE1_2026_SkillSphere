package org.example.professional_events.controller;

import lombok.RequiredArgsConstructor;
import org.example.professional_events.dto.LeaderboardDTO;
import org.example.professional_events.entity.Leaderboard;
import org.example.professional_events.entity.Team;
import org.example.professional_events.entity.TeamMember;
import org.example.professional_events.repository.LeaderboardRepository;
import org.example.professional_events.repository.TeamRepository;
import org.example.professional_events.repository.TeamMemberRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/leaderboards")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardRepository leaderboardRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;

    /**
     * Récupérer le leaderboard d'une compétition
     * GET /api/leaderboards/{competitionId}
     */
    @GetMapping("/{competitionId}")
    public ResponseEntity<List<LeaderboardDTO>> getLeaderboard(@PathVariable Long competitionId) {
        try {
            List<Leaderboard> leaderboard = leaderboardRepository.findByCompetitionIdOrderByRank(competitionId);
            List<LeaderboardDTO> dtos = leaderboard.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return new ResponseEntity<>(dtos, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Récupérer tous les leaderboards
     * GET /api/leaderboards
     */
    @GetMapping
    public ResponseEntity<List<LeaderboardDTO>> getAllLeaderboards() {
        try {
            List<Leaderboard> leaderboards = leaderboardRepository.findAll();
            List<LeaderboardDTO> dtos = leaderboards.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return new ResponseEntity<>(dtos, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Convertir Leaderboard en LeaderboardDTO avec informations de l'équipe
     */
    private LeaderboardDTO convertToDTO(Leaderboard leaderboard) {
        LeaderboardDTO dto = new LeaderboardDTO();
        dto.setLeaderboardId(leaderboard.getLeaderboardId());
        dto.setCompetitionId(leaderboard.getCompetitionId());
        dto.setUserId(leaderboard.getUserId());
        dto.setTeamId(leaderboard.getTeamId());
        dto.setRank(leaderboard.getRank());
        dto.setScore(leaderboard.getScore());
        dto.setLastUpdated(leaderboard.getLastUpdated());

        // Récupérer les informations de l'équipe si teamId existe
        if (leaderboard.getTeamId() != null) {
            teamRepository.findById(leaderboard.getTeamId()).ifPresent(team -> {
                dto.setParticipantName(team.getTeamName());
                
                // Récupérer les membres de l'équipe
                List<TeamMember> members = teamMemberRepository.findByTeam_TeamId(team.getTeamId());
                List<String> memberNames = members.stream()
                        .map(TeamMember::getUserName)
                        .collect(Collectors.toList());
                dto.setTeamMembers(memberNames);
            });
        }

        // TODO: Si userId existe (compétition individuelle), récupérer le nom de l'utilisateur
        // Pour l'instant, on se concentre sur les compétitions TEAM

        return dto;
    }
}
