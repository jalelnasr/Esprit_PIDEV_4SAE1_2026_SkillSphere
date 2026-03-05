package org.example.professional_events.controller;

import lombok.RequiredArgsConstructor;
import org.example.professional_events.dto.TeamDTO;
import org.example.professional_events.dto.TeamMemberDTO;
import org.example.professional_events.entity.Team;
import org.example.professional_events.entity.TeamMember;
import org.example.professional_events.security.JwtUtil;
import org.example.professional_events.service.TeamService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/competitions")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;
    private final JwtUtil jwtUtil;

    @GetMapping("/{competitionId}/teams")
    public ResponseEntity<List<TeamDTO>> getTeams(@PathVariable Long competitionId) {
        try {
            List<Team> teams = teamService.getTeamsWithMembers(competitionId);

            List<TeamDTO> teamDTOs = teams.stream().map(team -> {
                List<TeamMember> members = teamService.getTeamMembers(team.getTeamId());

                List<TeamMemberDTO> memberDTOs = members.stream()
                        .map(m -> new TeamMemberDTO(
                                m.getId(),
                                m.getTeam().getTeamId(),
                                m.getTeam().getTeamName(),
                                m.getUserId(),
                                m.getUserName(),
                                m.getJoinedAt()
                        ))
                        .collect(Collectors.toList());

                TeamDTO dto = new TeamDTO(
                        team.getTeamId(),
                        team.getTeamName(),
                        team.getCompetition().getCompetitionId(),
                        team.getMaxMembers(),
                        team.getCurrentMembers(),
                        team.isFull(),
                        memberDTOs,
                        team.getIsQualified(),
                        team.getQualifiedAt() != null ? team.getQualifiedAt().toString() : null,
                        team.getQualifiedBy()
                );

                return dto;
            }).collect(Collectors.toList());

            return new ResponseEntity<>(teamDTOs, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/teams/{teamId}/join")
    public ResponseEntity<TeamMemberDTO> joinTeam(
            @PathVariable Long teamId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Long userId = jwtUtil.extractUserId(token);
            String userName = jwtUtil.extractUsername(token);

            TeamMember member = teamService.joinTeam(teamId, userId, userName);

            TeamMemberDTO dto = new TeamMemberDTO(
                    member.getId(),
                    member.getTeam().getTeamId(),
                    member.getTeam().getTeamName(),
                    member.getUserId(),
                    member.getUserName(),
                    member.getJoinedAt()
            );

            return new ResponseEntity<>(dto, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/teams/{teamId}/leave")
    public ResponseEntity<Void> leaveTeam(
            @PathVariable Long teamId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Long userId = jwtUtil.extractUserId(token);

            teamService.leaveTeam(teamId, userId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{competitionId}/my-team")
    public ResponseEntity<TeamMemberDTO> getMyTeam(
            @PathVariable Long competitionId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Long userId = jwtUtil.extractUserId(token);

            TeamMember member = teamService.getUserTeamForCompetition(competitionId, userId);
            if (member == null) {
                return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
            }

            TeamMemberDTO dto = new TeamMemberDTO(
                    member.getId(),
                    member.getTeam().getTeamId(),
                    member.getTeam().getTeamName(),
                    member.getUserId(),
                    member.getUserName(),
                    member.getJoinedAt()
            );

            return new ResponseEntity<>(dto, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}