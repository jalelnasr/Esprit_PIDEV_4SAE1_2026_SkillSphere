package org.example.professional_events.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.professional_events.entity.*;
import org.example.professional_events.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class SmsService {

    private final UserContactRepository userContactRepository;
    private final SmsLogRepository smsLogRepository;
    private final SmsTemplateRepository smsTemplateRepository;
    private final TeamMemberRepository teamMemberRepository;

    @Value("${twilio.account.sid}")
    private String accountSid;

    @Value("${twilio.auth.token}")
    private String authToken;

    @Value("${twilio.phone.number}")
    private String fromPhoneNumber;

    @Value("${twilio.enabled:false}")
    private boolean twilioEnabled;

    private boolean twilioInitialized = false;

    /**
     * Initialiser Twilio (appelé une seule fois)
     */
    private void initializeTwilio() {
        if (!twilioInitialized && twilioEnabled) {
            try {
                Twilio.init(accountSid, authToken);
                twilioInitialized = true;
                log.info("Twilio initialized successfully");
            } catch (Exception e) {
                log.error("Failed to initialize Twilio: {}", e.getMessage());
                twilioEnabled = false;
            }
        }
    }

    /**
     * Envoyer un SMS à un utilisateur
     */
    @Transactional
    public SmsLog sendSms(Long userId, String message, String smsType, Long competitionId, Long matchId) {
        // Récupérer le contact de l'utilisateur
        Optional<UserContact> contactOpt = userContactRepository.findByUserId(userId);
        
        if (contactOpt.isEmpty() || contactOpt.get().getPhoneNumber() == null) {
            log.warn("No phone number found for user {}", userId);
            return createFailedLog(userId, null, message, smsType, competitionId, matchId, "No phone number");
        }

        UserContact contact = contactOpt.get();
        
        if (!contact.getSmsNotificationsEnabled()) {
            log.info("SMS notifications disabled for user {}", userId);
            return createFailedLog(userId, contact.getPhoneNumber(), message, smsType, competitionId, matchId, "Notifications disabled");
        }

        return sendSmsToPhone(userId, contact.getPhoneNumber(), message, smsType, competitionId, matchId);
    }

    /**
     * Envoyer un SMS à un numéro de téléphone
     */
    @Transactional
    public SmsLog sendSmsToPhone(Long userId, String phoneNumber, String message, String smsType, Long competitionId, Long matchId) {
        SmsLog smsLog = new SmsLog();
        smsLog.setUserId(userId);
        smsLog.setPhoneNumber(phoneNumber);
        smsLog.setMessage(message);
        smsLog.setSmsType(smsType);
        smsLog.setCompetitionId(competitionId);
        smsLog.setMatchId(matchId);
        smsLog.setStatus("PENDING");

        if (!twilioEnabled) {
            log.info("Twilio disabled - SMS would be sent to {}: {}", phoneNumber, message);
            smsLog.setStatus("SIMULATED");
            smsLog.setSentAt(LocalDateTime.now());
            return smsLogRepository.save(smsLog);
        }

        try {
            initializeTwilio();

            Message twilioMessage = Message.creator(
                new PhoneNumber(phoneNumber),
                new PhoneNumber(fromPhoneNumber),
                message
            ).create();

            smsLog.setTwilioSid(twilioMessage.getSid());
            smsLog.setStatus("SENT");
            smsLog.setSentAt(LocalDateTime.now());
            
            log.info("SMS sent successfully to {}: SID={}", phoneNumber, twilioMessage.getSid());

        } catch (Exception e) {
            log.error("Failed to send SMS to {}: {}", phoneNumber, e.getMessage());
            smsLog.setStatus("FAILED");
            smsLog.setErrorMessage(e.getMessage());
        }

        return smsLogRepository.save(smsLog);
    }

    /**
     * Envoyer un SMS en utilisant un template
     */
    @Transactional
    public SmsLog sendSmsFromTemplate(Long userId, String templateName, Map<String, String> variables, Long competitionId, Long matchId) {
        Optional<SmsTemplate> templateOpt = smsTemplateRepository.findByTemplateName(templateName);
        
        if (templateOpt.isEmpty()) {
            log.error("SMS template not found: {}", templateName);
            return createFailedLog(userId, null, "", "GENERAL", competitionId, matchId, "Template not found");
        }

        SmsTemplate template = templateOpt.get();
        String message = replacePlaceholders(template.getMessageTemplate(), variables);

        return sendSms(userId, message, template.getTemplateType(), competitionId, matchId);
    }

    /**
     * Envoyer un SMS de rappel de match (15 minutes avant)
     */
    @Transactional
    public void sendMatchReminder(Match match, int minutesBefore) {
        String templateName = minutesBefore == 15 ? "MATCH_REMINDER_15MIN" : "MATCH_REMINDER_1HOUR";
        
        // Récupérer les membres des deux équipes
        List<TeamMember> team1Members = teamMemberRepository.findByTeam_TeamId(match.getTeam1().getTeamId());
        List<TeamMember> team2Members = teamMemberRepository.findByTeam_TeamId(match.getTeam2().getTeamId());

        Map<String, String> variables = new HashMap<>();
        variables.put("matchNumber", String.valueOf(match.getMatchNumber()));
        variables.put("opponentName", "");
        variables.put("meetingUrl", "À venir");
        variables.put("matchTime", "À définir");

        // Envoyer aux membres de Team 1
        variables.put("teamName", match.getTeam1().getTeamName());
        variables.put("opponentName", match.getTeam2().getTeamName());
        for (TeamMember member : team1Members) {
            sendSmsFromTemplate(member.getUserId(), templateName, variables, match.getCompetition().getCompetitionId(), match.getMatchId());
        }

        // Envoyer aux membres de Team 2
        variables.put("teamName", match.getTeam2().getTeamName());
        variables.put("opponentName", match.getTeam1().getTeamName());
        for (TeamMember member : team2Members) {
            sendSmsFromTemplate(member.getUserId(), templateName, variables, match.getCompetition().getCompetitionId(), match.getMatchId());
        }

        log.info("Match reminders sent for match {}", match.getMatchId());
    }

    /**
     * Envoyer un SMS de qualification d'équipe
     */
    @Transactional
    public void sendTeamQualifiedNotification(Team team) {
        List<TeamMember> members = teamMemberRepository.findByTeam_TeamId(team.getTeamId());

        Map<String, String> variables = new HashMap<>();
        variables.put("teamName", team.getTeamName());
        variables.put("competitionTitle", team.getCompetition().getTitle());

        for (TeamMember member : members) {
            sendSmsFromTemplate(member.getUserId(), "TEAM_QUALIFIED", variables, team.getCompetition().getCompetitionId(), null);
        }

        log.info("Team qualified notifications sent for team {}", team.getTeamId());
    }

    /**
     * Envoyer un SMS de victoire
     */
    @Transactional
    public void sendWinnerNotification(Team team, Competition competition, int rank, int score) {
        List<TeamMember> members = teamMemberRepository.findByTeam_TeamId(team.getTeamId());

        Map<String, String> variables = new HashMap<>();
        variables.put("teamName", team.getTeamName());
        variables.put("competitionTitle", competition.getTitle());
        variables.put("rank", getRankText(rank));
        variables.put("score", String.valueOf(score));

        for (TeamMember member : members) {
            sendSmsFromTemplate(member.getUserId(), "WINNER_NOTIFICATION", variables, competition.getCompetitionId(), null);
        }

        log.info("Winner notifications sent for team {}", team.getTeamId());
    }

    /**
     * Créer un log d'échec
     */
    private SmsLog createFailedLog(Long userId, String phoneNumber, String message, String smsType, Long competitionId, Long matchId, String errorMessage) {
        SmsLog smsLog = new SmsLog();
        smsLog.setUserId(userId);
        smsLog.setPhoneNumber(phoneNumber);
        smsLog.setMessage(message);
        smsLog.setSmsType(smsType);
        smsLog.setCompetitionId(competitionId);
        smsLog.setMatchId(matchId);
        smsLog.setStatus("FAILED");
        smsLog.setErrorMessage(errorMessage);
        return smsLogRepository.save(smsLog);
    }

    /**
     * Remplacer les placeholders dans un template
     */
    private String replacePlaceholders(String template, Map<String, String> variables) {
        String result = template;
        for (Map.Entry<String, String> entry : variables.entrySet()) {
            result = result.replace("{" + entry.getKey() + "}", entry.getValue());
        }
        return result;
    }

    /**
     * Obtenir le texte du rang
     */
    private String getRankText(int rank) {
        return switch (rank) {
            case 1 -> "1ère";
            case 2 -> "2ème";
            case 3 -> "3ème";
            default -> rank + "ème";
        };
    }

    /**
     * Obtenir les statistiques SMS
     */
    public Map<String, Object> getSmsStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", smsLogRepository.count());
        stats.put("sent", smsLogRepository.countByStatus("SENT"));
        stats.put("failed", smsLogRepository.countByStatus("FAILED"));
        stats.put("pending", smsLogRepository.countByStatus("PENDING"));
        return stats;
    }

    /**
     * Obtenir l'historique SMS d'un utilisateur
     */
    public List<SmsLog> getUserSmsHistory(Long userId) {
        return smsLogRepository.findByUserId(userId);
    }

    /**
     * Obtenir l'historique SMS d'une compétition
     */
    public List<SmsLog> getCompetitionSmsHistory(Long competitionId) {
        return smsLogRepository.findByCompetitionId(competitionId);
    }

    /**
     * Envoyer un SMS à tous les participants d'une compétition
     */
    @Transactional
    public List<SmsLog> sendSmsToCompetitionParticipants(Long competitionId, String message) {
        List<SmsLog> results = new java.util.ArrayList<>();
        
        // Récupérer tous les membres des équipes de cette compétition
        List<TeamMember> members = teamMemberRepository.findAll().stream()
                .filter(m -> m.getTeam().getCompetition().getCompetitionId().equals(competitionId))
                .toList();

        log.info("Sending SMS to {} participants of competition {}", members.size(), competitionId);

        for (TeamMember member : members) {
            SmsLog smsLog = sendSms(member.getUserId(), message, "BROADCAST", competitionId, null);
            results.add(smsLog);
        }

        return results;
    }
}
