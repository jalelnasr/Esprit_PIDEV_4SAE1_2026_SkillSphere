package org.example.professional_events.service;

import lombok.RequiredArgsConstructor;
import org.example.professional_events.dto.DrawResultDTO;
import org.example.professional_events.dto.MatchDTO;
import org.example.professional_events.entity.*;
import org.example.professional_events.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DrawService {

    private final TeamRepository teamRepository;
    private final MatchRepository matchRepository;
    private final DrawHistoryRepository drawHistoryRepository;
    private final CompetitionRepository competitionRepository;
    private final LeaderboardRepository leaderboardRepository;

    /**
     * Effectuer le tirage au sort pour une compétition
     */
    @Transactional
    public DrawResultDTO performDraw(Long competitionId, Long formateurId) {
        // Récupérer la compétition
        Competition competition = competitionRepository.findById(competitionId)
                .orElseThrow(() -> new RuntimeException("Competition not found"));

        // Récupérer les équipes qualifiées
        List<Team> qualifiedTeams = teamRepository.findByCompetition_CompetitionIdAndIsQualified(competitionId, true);

        if (qualifiedTeams.isEmpty()) {
            throw new RuntimeException("Aucune équipe qualifiée");
        }

        if (qualifiedTeams.size() % 2 != 0) {
            throw new RuntimeException("Le nombre d'équipes qualifiées doit être pair");
        }

        // Supprimer les anciens matchs si le tirage est refait
        matchRepository.deleteByCompetition_CompetitionId(competitionId);

        // Mélanger aléatoirement les équipes (algorithme Fisher-Yates)
        List<Team> shuffledTeams = new ArrayList<>(qualifiedTeams);
        Collections.shuffle(shuffledTeams);

        // Créer les matchs
        List<Match> matches = new ArrayList<>();
        for (int i = 0; i < shuffledTeams.size(); i += 2) {
            Match match = new Match();
            match.setCompetition(competition);
            match.setMatchNumber((i / 2) + 1);
            match.setTeam1(shuffledTeams.get(i));
            match.setTeam2(shuffledTeams.get(i + 1));
            match.setStatus(Match.MatchStatus.PENDING);
            matches.add(match);
        }

        // Sauvegarder les matchs
        matches = matchRepository.saveAll(matches);

        // Créer l'historique du tirage
        DrawHistory history = new DrawHistory();
        history.setCompetition(competition);
        history.setDrawnBy(formateurId);
        history.setQualifiedTeamsCount(qualifiedTeams.size());
        history.setMatchesCreated(matches.size());
        history = drawHistoryRepository.save(history);

        // Mettre à jour la compétition
        competition.setDrawCompleted(true);
        competition.setDrawDate(LocalDateTime.now());
        competitionRepository.save(competition);

        // Convertir en DTO
        List<MatchDTO> matchDTOs = matches.stream()
                .map(this::convertToMatchDTO)
                .collect(Collectors.toList());

        DrawResultDTO result = new DrawResultDTO();
        result.setDrawId(history.getDrawId());
        result.setCompetitionId(competitionId);
        result.setQualifiedTeamsCount(qualifiedTeams.size());
        result.setMatchesCreated(matches.size());
        result.setDrawDate(history.getDrawDate());
        result.setMatches(matchDTOs);

        return result;
    }

    /**
     * Qualifier/Déqualifier une équipe
     */
    @Transactional
    public void toggleTeamQualification(Long teamId, Long formateurId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        if (team.getIsQualified() != null && team.getIsQualified()) {
            // Déqualifier
            team.setIsQualified(false);
            team.setQualifiedAt(null);
            team.setQualifiedBy(null);
        } else {
            // Qualifier
            team.setIsQualified(true);
            team.setQualifiedAt(LocalDateTime.now());
            team.setQualifiedBy(formateurId);
        }

        teamRepository.save(team);
    }

    /**
     * Déclarer le gagnant d'un match
     */
    @Transactional
    public void declareMatchWinner(Long matchId, Long winnerTeamId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found"));

        Team winner = teamRepository.findById(winnerTeamId)
                .orElseThrow(() -> new RuntimeException("Winner team not found"));

        // Vérifier que le gagnant est bien une des deux équipes du match
        if (!winner.getTeamId().equals(match.getTeam1().getTeamId()) &&
            !winner.getTeamId().equals(match.getTeam2().getTeamId())) {
            throw new RuntimeException("Winner must be one of the match teams");
        }

        match.setWinner(winner);
        match.setStatus(Match.MatchStatus.COMPLETED);
        match.setPlayedAt(LocalDateTime.now());

        matchRepository.save(match);
    }

    /**
     * Déclarer le gagnant final de la compétition
     */
    @Transactional
    public void declareFinalWinner(Long competitionId, Long winnerTeamId) {
        Competition competition = competitionRepository.findById(competitionId)
                .orElseThrow(() -> new RuntimeException("Competition not found"));

        Team winner = teamRepository.findById(winnerTeamId)
                .orElseThrow(() -> new RuntimeException("Winner team not found"));

        competition.setWinnerTeamId(winnerTeamId);
        competition.setWinnerDeclaredAt(LocalDateTime.now());
        competition.setStatus(Competition.CompetitionStatus.COMPLETED);

        competitionRepository.save(competition);

        // Créer les entrées dans le leaderboard
        updateLeaderboard(competitionId);
    }

    /**
     * Mettre à jour le leaderboard après déclaration du gagnant final
     */
    @Transactional
    public void updateLeaderboard(Long competitionId) {
        Competition competition = competitionRepository.findById(competitionId)
                .orElseThrow(() -> new RuntimeException("Competition not found"));

        // Supprimer les anciennes entrées du leaderboard pour cette compétition
        List<Leaderboard> oldEntries = leaderboardRepository.findByCompetitionId(competitionId);
        leaderboardRepository.deleteAll(oldEntries);

        // Récupérer tous les matchs de la compétition
        List<Match> matches = matchRepository.findByCompetition_CompetitionIdOrderByMatchNumberAsc(competitionId);

        // Calculer les scores des équipes
        List<Team> teams = teamRepository.findByCompetition_CompetitionId(competitionId);
        List<TeamScore> teamScores = new ArrayList<>();

        for (Team team : teams) {
            int wins = 0;
            int losses = 0;

            for (Match match : matches) {
                if (match.getWinner() != null) {
                    if (match.getTeam1().getTeamId().equals(team.getTeamId()) ||
                        match.getTeam2().getTeamId().equals(team.getTeamId())) {
                        
                        if (match.getWinner().getTeamId().equals(team.getTeamId())) {
                            wins++;
                        } else {
                            losses++;
                        }
                    }
                }
            }

            // Score = nombre de victoires * 3 + nombre de matchs joués
            int score = (wins * 3) + (wins + losses);
            
            // Bonus pour le gagnant final
            if (competition.getWinnerTeamId() != null && 
                competition.getWinnerTeamId().equals(team.getTeamId())) {
                score += 10; // Bonus de 10 points pour le gagnant final
            }

            teamScores.add(new TeamScore(team, score, wins, losses));
        }

        // Trier par score décroissant
        teamScores.sort((a, b) -> Integer.compare(b.score, a.score));

        // Créer les entrées du leaderboard
        int rank = 1;
        for (TeamScore teamScore : teamScores) {
            Leaderboard entry = new Leaderboard();
            entry.setCompetitionId(competitionId);
            entry.setTeamId(teamScore.team.getTeamId());
            entry.setUserId(null); // Pour les compétitions TEAM, on met l'équipe
            entry.setRank(rank++);
            entry.setScore(teamScore.score);
            entry.setLastUpdated(LocalDateTime.now());

            leaderboardRepository.save(entry);
        }
    }

    /**
     * Classe interne pour calculer les scores
     */
    private static class TeamScore {
        Team team;
        int score;
        int wins;
        int losses;

        TeamScore(Team team, int score, int wins, int losses) {
            this.team = team;
            this.score = score;
            this.wins = wins;
            this.losses = losses;
        }
    }

    /**
     * Récupérer les matchs d'une compétition
     */
    public List<MatchDTO> getMatchesByCompetition(Long competitionId) {
        List<Match> matches = matchRepository.findByCompetition_CompetitionIdOrderByMatchNumberAsc(competitionId);
        return matches.stream()
                .map(this::convertToMatchDTO)
                .collect(Collectors.toList());
    }

    /**
     * Récupérer l'historique des tirages d'une compétition
     */
    public List<DrawHistory> getDrawHistory(Long competitionId) {
        return drawHistoryRepository.findByCompetition_CompetitionIdOrderByDrawDateDesc(competitionId);
    }

    /**
     * Convertir Match en MatchDTO
     */
    private MatchDTO convertToMatchDTO(Match match) {
        MatchDTO dto = new MatchDTO();
        dto.setMatchId(match.getMatchId());
        dto.setCompetitionId(match.getCompetition().getCompetitionId());
        dto.setMatchNumber(match.getMatchNumber());

        // Team 1
        dto.setTeam1Id(match.getTeam1().getTeamId());
        dto.setTeam1Name(match.getTeam1().getTeamName());
        dto.setTeam1Members(match.getTeam1().getCurrentMembers());

        // Team 2
        dto.setTeam2Id(match.getTeam2().getTeamId());
        dto.setTeam2Name(match.getTeam2().getTeamName());
        dto.setTeam2Members(match.getTeam2().getCurrentMembers());

        // Winner
        if (match.getWinner() != null) {
            dto.setWinnerTeamId(match.getWinner().getTeamId());
            dto.setWinnerTeamName(match.getWinner().getTeamName());
        }

        dto.setStatus(match.getStatus().name());
        dto.setCreatedAt(match.getCreatedAt());
        dto.setPlayedAt(match.getPlayedAt());
        dto.setNotes(match.getNotes());

        return dto;
    }
}
