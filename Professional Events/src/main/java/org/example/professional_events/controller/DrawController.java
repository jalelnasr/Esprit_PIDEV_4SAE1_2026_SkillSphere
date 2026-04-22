package org.example.professional_events.controller;

import lombok.RequiredArgsConstructor;
import org.example.professional_events.dto.DrawResultDTO;
import org.example.professional_events.dto.MatchDTO;
import org.example.professional_events.entity.DrawHistory;
import org.example.professional_events.security.JwtUtil;
import org.example.professional_events.service.DrawService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/competitions")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class DrawController {

    private final DrawService drawService;
    private final JwtUtil jwtUtil;

    /**
     * Effectuer le tirage au sort
     * POST /api/competitions/{competitionId}/draw
     */
    @PostMapping("/{competitionId}/draw")
    public ResponseEntity<DrawResultDTO> performDraw(
            @PathVariable Long competitionId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Long formateurId = jwtUtil.extractUserId(token);

            DrawResultDTO result = drawService.performDraw(competitionId, formateurId);
            return new ResponseEntity<>(result, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Qualifier/Déqualifier une équipe
     * PUT /api/competitions/teams/{teamId}/qualify
     */
    @PutMapping("/teams/{teamId}/qualify")
    public ResponseEntity<Void> toggleTeamQualification(
            @PathVariable Long teamId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Long formateurId = jwtUtil.extractUserId(token);

            drawService.toggleTeamQualification(teamId, formateurId);
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Récupérer les matchs d'une compétition
     * GET /api/competitions/{competitionId}/matches
     */
    @GetMapping("/{competitionId}/matches")
    public ResponseEntity<List<MatchDTO>> getMatches(@PathVariable Long competitionId) {
        try {
            List<MatchDTO> matches = drawService.getMatchesByCompetition(competitionId);
            return new ResponseEntity<>(matches, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Déclarer le gagnant d'un match
     * PUT /api/competitions/matches/{matchId}/winner
     * Body: { "winnerTeamId": 123 }
     */
    @PutMapping("/matches/{matchId}/winner")
    public ResponseEntity<Void> declareMatchWinner(
            @PathVariable Long matchId,
            @RequestBody Map<String, Long> body,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long winnerTeamId = body.get("winnerTeamId");
            if (winnerTeamId == null) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }

            drawService.declareMatchWinner(matchId, winnerTeamId);
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Déclarer le gagnant final de la compétition
     * PUT /api/competitions/{competitionId}/winner
     * Body: { "winnerTeamId": 123 }
     */
    @PutMapping("/{competitionId}/winner")
    public ResponseEntity<Void> declareFinalWinner(
            @PathVariable Long competitionId,
            @RequestBody Map<String, Long> body,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long winnerTeamId = body.get("winnerTeamId");
            if (winnerTeamId == null) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }

            drawService.declareFinalWinner(competitionId, winnerTeamId);
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Récupérer l'historique des tirages
     * GET /api/competitions/{competitionId}/draw-history
     */
    @GetMapping("/{competitionId}/draw-history")
    public ResponseEntity<List<DrawHistory>> getDrawHistory(@PathVariable Long competitionId) {
        try {
            List<DrawHistory> history = drawService.getDrawHistory(competitionId);
            return new ResponseEntity<>(history, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
