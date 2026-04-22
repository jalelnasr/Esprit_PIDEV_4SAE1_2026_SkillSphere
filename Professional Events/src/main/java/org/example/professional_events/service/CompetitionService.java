package org.example.professional_events.service;

import org.example.professional_events.entity.Competition;
import org.example.professional_events.entity.Participant;
import org.example.professional_events.entity.Team;
import org.example.professional_events.repository.CompetitionRepository;
import org.example.professional_events.repository.ParticipantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class CompetitionService {

    private final CompetitionRepository competitionRepository;
    private final ParticipantRepository participantRepository;
    private final TeamService teamService;
    private final org.example.professional_events.repository.UserContactRepository userContactRepository;
    private final org.example.professional_events.repository.TeamMemberRepository teamMemberRepository;

    public Optional<Competition> getCompetitionById(Long competitionId) {
        return competitionRepository.findById(competitionId);
    }
    public CompetitionService(CompetitionRepository competitionRepository,
                              ParticipantRepository participantRepository,
                              TeamService teamService,
                              org.example.professional_events.repository.UserContactRepository userContactRepository,
                              org.example.professional_events.repository.TeamMemberRepository teamMemberRepository) {
        this.competitionRepository = competitionRepository;
        this.participantRepository = participantRepository;
        this.teamService = teamService;
        this.userContactRepository = userContactRepository;
        this.teamMemberRepository = teamMemberRepository;
    }

    public Competition createCompetition(Competition competition) {
        Competition saved = competitionRepository.save(competition);

        // ✅ Créer des teams si TEAM ou BOTH
        if (saved.getParticipationType() == Competition.ParticipationType.TEAM
                || saved.getParticipationType() == Competition.ParticipationType.BOTH) {
            teamService.createTeamsForCompetition(saved);
        }
        return saved;
    }

    public List<Competition> getAllCompetitions() {
        return competitionRepository.findAll();
    }

    public Competition updateCompetition(Long id, Competition payload) {
        Competition c = competitionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Competition not found: " + id));

        c.setTitle(payload.getTitle());
        c.setDescription(payload.getDescription());
        c.setType(payload.getType());
        c.setParticipationType(payload.getParticipationType());
        c.setStartDate(payload.getStartDate());
        c.setEndDate(payload.getEndDate());
        c.setMaxParticipants(payload.getMaxParticipants());
        c.setStatus(payload.getStatus());
        c.setNumberOfTeams(payload.getNumberOfTeams());
        c.setParticipantsPerTeam(payload.getParticipantsPerTeam());

        return competitionRepository.save(c);
    }

    public void deleteCompetition(Long id) {
        // Supprimer d'abord les participants
        List<Participant> participants = participantRepository.findByCompetitionId(id);
        participantRepository.deleteAll(participants);
        
        // Supprimer les équipes et leurs membres
        List<Team> teams = teamService.getTeamsWithMembers(id);
        for (Team team : teams) {
            teamService.deleteTeamWithMembers(team.getTeamId());
        }
        
        // Supprimer la compétition
        competitionRepository.deleteById(id);
    }

    // ✅ My Participations (pour front)
    public List<Participant> getUserParticipations(Long userId) {
        return participantRepository.findByUserId(userId);
    }

    public Participant registerParticipant(Long userId, Long competitionId) {
        Competition competition = competitionRepository.findById(competitionId)
                .orElseThrow(() -> new RuntimeException("Competition not found: " + competitionId));

        if (competition.getStatus() != Competition.CompetitionStatus.OPEN) {
            throw new RuntimeException("Competition is not open");
        }

        boolean already = participantRepository.findByUserIdAndCompetitionId(userId, competitionId).isPresent();
        if (already) throw new RuntimeException("Already registered");

        long count = participantRepository.countByCompetitionId(competitionId);
        if (competition.getMaxParticipants() != null && count >= competition.getMaxParticipants()) {
            throw new RuntimeException("Max participants reached");
        }

        Participant p = new Participant();
        p.setUserId(userId);
        p.setCompetitionId(competitionId);
        p.setRegistrationDate(LocalDateTime.now());
        p.setStatus(Participant.ParticipantStatus.REGISTERED);

        return participantRepository.save(p);
    }
    public Competition save(Competition competition) {
        return competitionRepository.save(competition);
    }

    public void cancelRegistration(Long userId, Long competitionId) {
        Optional<Participant> participantOptional =
                participantRepository.findByUserIdAndCompetitionId(userId, competitionId);

        if (participantOptional.isEmpty()) {
            throw new RuntimeException("Registration not found");
        }

        participantRepository.delete(participantOptional.get());
    }

    public Competition updateCompetitionStatus(Long competitionId, Competition.CompetitionStatus status) {
        Competition competition = competitionRepository.findById(competitionId)
                .orElseThrow(() -> new RuntimeException("Competition not found: " + competitionId));

        competition.setStatus(status);
        return competitionRepository.save(competition);
    }

    public List<Participant> getCompetitionParticipants(Long competitionId) {
        return participantRepository.findByCompetitionId(competitionId);
    }

    public List<Participant> getUserRegistrations(Long userId) {
        return participantRepository.findByUserId(userId);
    }

    public Participant updateParticipantScore(Long registrationId, Integer score, Integer rank) {
        Participant participant = participantRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Participant not found: " + registrationId));

        participant.setScore(score);
        participant.setRank(rank);
        return participantRepository.save(participant);
    }

    public List<Competition> getOpenCompetitions() {
        return competitionRepository.findByStatus(Competition.CompetitionStatus.OPEN);
    }

    public List<Competition> getClosedCompetitions() {
        return competitionRepository.findByStatus(Competition.CompetitionStatus.CLOSED);
    }

    public List<Competition> getMyParticipations(Long userId) {
        // 1. Compétitions INDIVIDUAL où l'utilisateur est inscrit
        List<Participant> participants = participantRepository.findByUserId(userId);
        List<Competition> individualCompetitions = participants.stream()
            .map(p -> competitionRepository.findById(p.getCompetitionId()))
            .filter(Optional::isPresent)
            .map(Optional::get)
            .collect(java.util.stream.Collectors.toList());
        
        // 2. Compétitions TEAM où l'utilisateur est membre d'une équipe
        List<Competition> teamCompetitions = teamService.getCompetitionsWhereUserIsInTeam(userId);
        
        // 3. Fusionner les deux listes (éviter les doublons pour BOTH)
        java.util.Set<Long> competitionIds = new java.util.HashSet<>();
        List<Competition> allCompetitions = new java.util.ArrayList<>();
        
        for (Competition comp : individualCompetitions) {
            if (competitionIds.add(comp.getCompetitionId())) {
                allCompetitions.add(comp);
            }
        }
        
        for (Competition comp : teamCompetitions) {
            if (competitionIds.add(comp.getCompetitionId())) {
                allCompetitions.add(comp);
            }
        }
        
        return allCompetitions;
    }

    public List<Competition> getCompetitionsByCreator(Long userId) {
        return competitionRepository.findByCreatedBy(userId);
    }

    public Optional<Participant> getMyRegistration(Long userId, Long competitionId) {
        return participantRepository.findByUserIdAndCompetitionId(userId, competitionId);
    }


    /**
     * Obtenir les membres de l'équipe gagnante avec leurs contacts
     */
    public List<Map<String, Object>> getWinnerTeamMembersWithContacts(Long winnerTeamId) {
        List<org.example.professional_events.entity.TeamMember> members =
            teamMemberRepository.findByTeam_TeamId(winnerTeamId);

        List<Long> userIds = members.stream()
            .map(org.example.professional_events.entity.TeamMember::getUserId)
            .collect(java.util.stream.Collectors.toList());

        // Récupérer les contacts pour ces utilisateurs
        List<org.example.professional_events.entity.UserContact> contacts =
            new java.util.ArrayList<>();
        for (Long userId : userIds) {
            userContactRepository.findByUserId(userId)
                .ifPresent(contacts::add);
        }

        Map<Long, org.example.professional_events.entity.UserContact> contactMap =
            contacts.stream()
                .collect(java.util.stream.Collectors.toMap(
                    org.example.professional_events.entity.UserContact::getUserId,
                    c -> c
                ));

        return members.stream().map(member -> {
            Map<String, Object> memberData = new java.util.HashMap<>();
            memberData.put("id", member.getId());
            memberData.put("userId", member.getUserId());
            memberData.put("userName", member.getUserName());
            memberData.put("teamId", member.getTeam().getTeamId());
            memberData.put("teamName", member.getTeam().getTeamName());

            org.example.professional_events.entity.UserContact contact = contactMap.get(member.getUserId());
            memberData.put("phoneNumber", contact != null ? contact.getPhoneNumber() : null);
            memberData.put("hasPhone", contact != null && contact.getPhoneNumber() != null);

            return memberData;
        }).collect(java.util.stream.Collectors.toList());
    }

}