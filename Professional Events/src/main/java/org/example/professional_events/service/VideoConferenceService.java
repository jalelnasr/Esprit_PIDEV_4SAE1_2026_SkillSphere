package org.example.professional_events.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.professional_events.entity.Match;
import org.example.professional_events.entity.TeamMember;
import org.example.professional_events.repository.MatchRepository;
import org.example.professional_events.repository.TeamMemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class VideoConferenceService {

    private final MatchRepository matchRepository;
    private final TeamMemberRepository teamMemberRepository;
    
    @Autowired
    @Lazy
    private SmsService smsService;

    public VideoConferenceService(MatchRepository matchRepository, TeamMemberRepository teamMemberRepository) {
        this.matchRepository = matchRepository;
        this.teamMemberRepository = teamMemberRepository;
    }

    private static final String JITSI_BASE_URL = "https://meet.jit.si/";

    /**
     * Créer une URL de visioconférence Jitsi Meet pour un match
     */
    @Transactional
    public String createMeetingUrl(Long matchId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found"));

        if (match.getMeetingUrl() != null) {
            log.info("Meeting URL already exists for match {}", matchId);
            return match.getMeetingUrl();
        }

        // Générer un nom de salle unique
        String roomName = generateRoomName(match);
        String meetingUrl = JITSI_BASE_URL + roomName;

        match.setMeetingUrl(meetingUrl);
        matchRepository.save(match);

        log.info("Created meeting URL for match {}: {}", matchId, meetingUrl);
        return meetingUrl;
    }

    /**
     * Planifier un match avec date et heure
     */
    @Transactional
    public Match scheduleMatch(Long matchId, LocalDateTime scheduledAt) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found"));

        match.setScheduledAt(scheduledAt);

        // Créer automatiquement l'URL de visio si elle n'existe pas
        if (match.getMeetingUrl() == null) {
            String meetingUrl = createMeetingUrl(matchId);
            match.setMeetingUrl(meetingUrl);
        }

        Match saved = matchRepository.save(match);
        log.info("Match {} scheduled for {}", matchId, scheduledAt);

        return saved;
    }

    /**
     * Démarrer un match (passer en IN_PROGRESS et créer l'URL si nécessaire)
     */
    @Transactional
    public Match startMatch(Long matchId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found"));

        if (match.getStatus() == Match.MatchStatus.COMPLETED) {
            throw new RuntimeException("Match already completed");
        }

        // Créer l'URL de visio si elle n'existe pas
        if (match.getMeetingUrl() == null) {
            String meetingUrl = createMeetingUrl(matchId);
            match.setMeetingUrl(meetingUrl);
        }

        match.setStatus(Match.MatchStatus.IN_PROGRESS);
        Match saved = matchRepository.save(match);

        log.info("Match {} started with meeting URL: {}", matchId, match.getMeetingUrl());
        return saved;
    }

    /**
     * Envoyer les invitations SMS aux participants d'un match
     */
    @Transactional
    public void sendMeetingInvitations(Long matchId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found"));

        if (match.getMeetingUrl() == null) {
            throw new RuntimeException("Meeting URL not created yet");
        }

        // Récupérer les membres des deux équipes
        List<TeamMember> team1Members = teamMemberRepository.findByTeam_TeamId(match.getTeam1().getTeamId());
        List<TeamMember> team2Members = teamMemberRepository.findByTeam_TeamId(match.getTeam2().getTeamId());

        String message = buildInvitationMessage(match);

        // Envoyer aux membres de l'équipe 1
        for (TeamMember member : team1Members) {
            smsService.sendSms(member.getUserId(), message, "MATCH_INVITATION", 
                    match.getCompetition().getCompetitionId(), matchId);
        }

        // Envoyer aux membres de l'équipe 2
        for (TeamMember member : team2Members) {
            smsService.sendSms(member.getUserId(), message, "MATCH_INVITATION", 
                    match.getCompetition().getCompetitionId(), matchId);
        }

        log.info("Meeting invitations sent for match {}", matchId);
    }

    /**
     * Obtenir l'URL de visio d'un match
     */
    public String getMeetingUrl(Long matchId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found"));
        return match.getMeetingUrl();
    }

    /**
     * Générer un nom de salle unique pour Jitsi
     */
    private String generateRoomName(Match match) {
        String competitionName = sanitizeForUrl(match.getCompetition().getTitle());
        String team1Name = sanitizeForUrl(match.getTeam1().getTeamName());
        String team2Name = sanitizeForUrl(match.getTeam2().getTeamName());
        String uniqueId = UUID.randomUUID().toString().substring(0, 8);

        return String.format("SkillSphere-%s-Match%d-%s-vs-%s-%s",
                competitionName,
                match.getMatchNumber(),
                team1Name,
                team2Name,
                uniqueId);
    }

    /**
     * Nettoyer une chaîne pour l'utiliser dans une URL
     */
    private String sanitizeForUrl(String input) {
        return input.replaceAll("[^a-zA-Z0-9]", "")
                .substring(0, Math.min(input.length(), 20));
    }

    /**
     * Construire le message d'invitation
     */
    private String buildInvitationMessage(Match match) {
        StringBuilder message = new StringBuilder();
        message.append("🎥 Match ").append(match.getMatchNumber()).append("\n");
        message.append(match.getTeam1().getTeamName()).append(" vs ").append(match.getTeam2().getTeamName()).append("\n");

        if (match.getScheduledAt() != null) {
            message.append("📅 ").append(match.getScheduledAt().toString()).append("\n");
        }

        message.append("🔗 Rejoindre: ").append(match.getMeetingUrl());

        return message.toString();
    }
}
