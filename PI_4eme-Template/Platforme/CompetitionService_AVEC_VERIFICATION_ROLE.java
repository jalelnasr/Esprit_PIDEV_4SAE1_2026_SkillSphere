package org.example.professional_events.service;

import org.example.professional_events.entity.Competition;
import org.example.professional_events.entity.Participant;
import org.example.professional_events.repository.CompetitionRepository;
import org.example.professional_events.repository.ParticipantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CompetitionService {

    @Autowired
    private CompetitionRepository competitionRepository;

    @Autowired
    private ParticipantRepository participantRepository;

    @Autowired
    private TeamService teamService;

    @Autowired
    private RestTemplate restTemplate;

    /**
     * Create a new competition
     */
    public Competition createCompetition(Competition competition) {
        if (competition.getStatus() == null) {
            competition.setStatus(Competition.CompetitionStatus.OPEN);
        }
        
        // Set default participation type if not specified
        if (competition.getParticipationType() == null) {
            competition.setParticipationType(Competition.ParticipationType.INDIVIDUAL);
        }
        
        Competition savedCompetition = competitionRepository.save(competition);
        
        // If team-based competition, create teams automatically
        if (savedCompetition.getParticipationType() == Competition.ParticipationType.TEAM) {
            if (savedCompetition.getNumberOfTeams() != null && savedCompetition.getParticipantsPerTeam() != null) {
                teamService.createTeamsForCompetition(savedCompetition.getCompetitionId());
            }
        }
        
        return savedCompetition;
    }

    /**
     * Register a participant to a competition
     * ⭐ NOUVEAU: Vérification du rôle - Seuls les APPRENANTS peuvent s'inscrire
     */
    public Participant registerParticipant(Long userId, Long competitionId) {
        Optional<Competition> competitionOptional = competitionRepository.findById(competitionId);
        if (!competitionOptional.isPresent()) {
            throw new RuntimeException("Competition not found with ID: " + competitionId);
        }

        Competition competition = competitionOptional.get();

        // ⭐ NOUVEAU: Vérifier le rôle de l'utilisateur
        String userRole = getUserRole(userId);
        if ("FORMATEUR".equalsIgnoreCase(userRole)) {
            throw new RuntimeException("Les formateurs ne peuvent pas s'inscrire aux compétitions");
        }

        // Check if competition is open
        if (competition.getStatus() != Competition.CompetitionStatus.OPEN) {
            throw new RuntimeException("Competition is not open for registration");
        }

        // Check if user is already registered
        Optional<Participant> existingParticipant =
            participantRepository.findByUserIdAndCompetitionId(userId, competitionId);
        if (existingParticipant.isPresent()) {
            throw new RuntimeException("User is already registered for this competition");
        }

        // Check if max participants limit is reached
        long participantCount = participantRepository.findByCompetitionId(competitionId).size();
        if (competition.getMaxParticipants() != null && participantCount >= competition.getMaxParticipants()) {
            throw new RuntimeException("Competition has reached maximum participants limit");
        }

        Participant participant = new Participant();
        participant.setUserId(userId);
        participant.setCompetitionId(competitionId);
        participant.setRegistrationDate(LocalDateTime.now());
        participant.setStatus(Participant.ParticipantStatus.REGISTERED);

        return participantRepository.save(participant);
    }

    /**
     * ⭐ NOUVELLE MÉTHODE: Récupérer le rôle de l'utilisateur depuis PlatformeBack
     * 
     * Option 1: Via RestTemplate (si Eureka est configuré)
     * Option 2: Via le JWT (si le rôle est dans le token)
     */
    private String getUserRole(Long userId) {
        try {
            // Option 1: Appel REST vers PlatformeBack
            // Si vous utilisez Eureka, le nom du service sera résolu automatiquement
            String url = "http://localhost:8086/api/users/" + userId + "/role";
            String role = restTemplate.getForObject(url, String.class);
            return role;
            
        } catch (Exception e) {
            System.err.println("⚠️ Erreur lors de la récupération du rôle: " + e.getMessage());
            // Par défaut, autoriser (ou bloquer selon votre choix de sécurité)
            // Pour plus de sécurité, vous pouvez throw une exception ici
            return "APPRENANT";
        }
    }

    /**
     * Get all competitions
     */
    public List<Competition> getAllCompetitions() {
        return competitionRepository.findAll();
    }

    /**
     * Get competition by ID
     */
    public Optional<Competition> getCompetitionById(Long competitionId) {
        return competitionRepository.findById(competitionId);
    }

    /**
     * Get open competitions
     */
    public List<Competition> getOpenCompetitions() {
        return competitionRepository.findByStatus(Competition.CompetitionStatus.OPEN);
    }

    /**
     * Get closed competitions
     */
    public List<Competition> getClosedCompetitions() {
        return competitionRepository.findByStatus(Competition.CompetitionStatus.CLOSED);
    }

    /**
     * Update competition status
     */
    public Competition updateCompetitionStatus(Long competitionId, Competition.CompetitionStatus status) {
        Optional<Competition> competitionOptional = competitionRepository.findById(competitionId);
        if (!competitionOptional.isPresent()) {
            throw new RuntimeException("Competition not found with ID: " + competitionId);
        }

        Competition competition = competitionOptional.get();
        competition.setStatus(status);
        return competitionRepository.save(competition);
    }

    /**
     * Get all participants for a competition
     */
    public List<Participant> getCompetitionParticipants(Long competitionId) {
        return participantRepository.findByCompetitionId(competitionId);
    }

    /**
     * Get user's registrations
     */
    public List<Participant> getUserRegistrations(Long userId) {
        return participantRepository.findByUserId(userId);
    }

    /**
     * Update participant score and rank
     */
    public Participant updateParticipantScore(Long registrationId, Integer score, Integer rank) {
        Optional<Participant> participantOptional = participantRepository.findById(registrationId);
        if (!participantOptional.isPresent()) {
            throw new RuntimeException("Participant registration not found with ID: " + registrationId);
        }

        Participant participant = participantOptional.get();
        participant.setScore(score);
        participant.setRank(rank);
        return participantRepository.save(participant);
    }

    /**
     * Delete competition
     */
    public void deleteCompetition(Long competitionId) {
        competitionRepository.deleteById(competitionId);
    }

    /**
     * Cancel user registration for a competition
     */
    public void cancelRegistration(Long userId, Long competitionId) {
        Optional<Participant> participantOptional = 
            participantRepository.findByUserIdAndCompetitionId(userId, competitionId);
        
        if (!participantOptional.isPresent()) {
            throw new RuntimeException("Registration not found for user " + userId + " in competition " + competitionId);
        }
        
        participantRepository.delete(participantOptional.get());
    }
}
