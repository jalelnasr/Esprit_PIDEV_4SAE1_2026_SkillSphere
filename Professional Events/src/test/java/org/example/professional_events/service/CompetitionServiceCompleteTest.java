package org.example.professional_events.service;

import org.example.professional_events.entity.Competition;
import org.example.professional_events.entity.Participant;
import org.example.professional_events.entity.Team;
import org.example.professional_events.repository.CompetitionRepository;
import org.example.professional_events.repository.ParticipantRepository;
import org.example.professional_events.repository.TeamMemberRepository;
import org.example.professional_events.repository.UserContactRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CompetitionServiceCompleteTest {

    @Mock private CompetitionRepository competitionRepository;
    @Mock private ParticipantRepository participantRepository;
    @Mock private TeamService teamService;
    @Mock private UserContactRepository userContactRepository;
    @Mock private TeamMemberRepository teamMemberRepository;

    @InjectMocks private CompetitionService competitionService;

    private Competition openCompetition;
    private Competition closedCompetition;
    private Competition teamCompetition;

    @BeforeEach
    void setUp() {
        openCompetition = new Competition();
        openCompetition.setCompetitionId(1L);
        openCompetition.setTitle("Hackathon 2026");
        openCompetition.setStatus(Competition.CompetitionStatus.OPEN);
        openCompetition.setParticipationType(Competition.ParticipationType.INDIVIDUAL);
        openCompetition.setMaxParticipants(10);
        openCompetition.setCreatedBy(8L);

        closedCompetition = new Competition();
        closedCompetition.setCompetitionId(2L);
        closedCompetition.setTitle("Closed Event");
        closedCompetition.setStatus(Competition.CompetitionStatus.CLOSED);
        closedCompetition.setParticipationType(Competition.ParticipationType.INDIVIDUAL);

        teamCompetition = new Competition();
        teamCompetition.setCompetitionId(3L);
        teamCompetition.setTitle("Team Challenge");
        teamCompetition.setStatus(Competition.CompetitionStatus.OPEN);
        teamCompetition.setParticipationType(Competition.ParticipationType.TEAM);
        teamCompetition.setNumberOfTeams(4);
    }

    // ===== CREATE =====

    @Test
    void createCompetition_INDIVIDUAL_shouldNotCreateTeams() {
        when(competitionRepository.save(any())).thenReturn(openCompetition);

        competitionService.createCompetition(openCompetition);

        verify(teamService, never()).createTeamsForCompetition(any());
    }

    @Test
    void createCompetition_TEAM_shouldCreateTeams() {
        when(competitionRepository.save(any())).thenReturn(teamCompetition);

        competitionService.createCompetition(teamCompetition);

        verify(teamService).createTeamsForCompetition(teamCompetition);
    }

    @Test
    void createCompetition_BOTH_shouldCreateTeams() {
        Competition bothComp = new Competition();
        bothComp.setParticipationType(Competition.ParticipationType.BOTH);
        when(competitionRepository.save(any())).thenReturn(bothComp);

        competitionService.createCompetition(bothComp);

        verify(teamService).createTeamsForCompetition(bothComp);
    }

    // ===== READ =====

    @Test
    void getAllCompetitions_shouldReturnAllCompetitions() {
        when(competitionRepository.findAll()).thenReturn(List.of(openCompetition, closedCompetition, teamCompetition));

        List<Competition> result = competitionService.getAllCompetitions();

        assertEquals(3, result.size());
    }

    @Test
    void getCompetitionById_shouldReturnCompetition() {
        when(competitionRepository.findById(1L)).thenReturn(Optional.of(openCompetition));

        Optional<Competition> result = competitionService.getCompetitionById(1L);

        assertTrue(result.isPresent());
        assertEquals("Hackathon 2026", result.get().getTitle());
    }

    @Test
    void getCompetitionById_shouldReturnEmptyWhenNotFound() {
        when(competitionRepository.findById(99L)).thenReturn(Optional.empty());

        Optional<Competition> result = competitionService.getCompetitionById(99L);

        assertFalse(result.isPresent());
    }

    @Test
    void getOpenCompetitions_shouldReturnOnlyOpenOnes() {
        when(competitionRepository.findByStatus(Competition.CompetitionStatus.OPEN))
                .thenReturn(List.of(openCompetition, teamCompetition));

        List<Competition> result = competitionService.getOpenCompetitions();

        assertEquals(2, result.size());
        result.forEach(c -> assertEquals(Competition.CompetitionStatus.OPEN, c.getStatus()));
    }

    @Test
    void getClosedCompetitions_shouldReturnOnlyClosedOnes() {
        when(competitionRepository.findByStatus(Competition.CompetitionStatus.CLOSED))
                .thenReturn(List.of(closedCompetition));

        List<Competition> result = competitionService.getClosedCompetitions();

        assertEquals(1, result.size());
        assertEquals("Closed Event", result.get(0).getTitle());
    }

    @Test
    void getCompetitionsByCreator_shouldReturnCreatorCompetitions() {
        when(competitionRepository.findByCreatedBy(8L)).thenReturn(List.of(openCompetition));

        List<Competition> result = competitionService.getCompetitionsByCreator(8L);

        assertEquals(1, result.size());
        assertEquals(8L, result.get(0).getCreatedBy());
    }

    // ===== UPDATE =====

    @Test
    void updateCompetition_shouldUpdateAllFields() {
        Competition payload = new Competition();
        payload.setTitle("Updated Title");
        payload.setDescription("New description");
        payload.setType(Competition.CompetitionType.ONLINE);
        payload.setParticipationType(Competition.ParticipationType.INDIVIDUAL);
        payload.setMaxParticipants(20);
        payload.setStatus(Competition.CompetitionStatus.CLOSED);

        when(competitionRepository.findById(1L)).thenReturn(Optional.of(openCompetition));
        when(competitionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Competition result = competitionService.updateCompetition(1L, payload);

        assertEquals("Updated Title", result.getTitle());
        assertEquals("New description", result.getDescription());
        assertEquals(20, result.getMaxParticipants());
        assertEquals(Competition.CompetitionStatus.CLOSED, result.getStatus());
    }

    @Test
    void updateCompetition_shouldThrowWhenNotFound() {
        when(competitionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () ->
                competitionService.updateCompetition(99L, new Competition()));
    }

    @Test
    void updateCompetitionStatus_shouldChangeStatus() {
        when(competitionRepository.findById(1L)).thenReturn(Optional.of(openCompetition));
        when(competitionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Competition result = competitionService.updateCompetitionStatus(1L, Competition.CompetitionStatus.IN_PROGRESS);

        assertEquals(Competition.CompetitionStatus.IN_PROGRESS, result.getStatus());
    }

    // ===== DELETE =====

    @Test
    void deleteCompetition_shouldDeleteParticipantsTeamsAndCompetition() {
        when(participantRepository.findByCompetitionId(1L)).thenReturn(List.of());
        when(teamService.getTeamsWithMembers(1L)).thenReturn(List.of());

        competitionService.deleteCompetition(1L);

        verify(participantRepository).deleteAll(any());
        verify(competitionRepository).deleteById(1L);
    }

    @Test
    void deleteCompetition_shouldDeleteTeamsWithMembers() {
        Team team = new Team();
        team.setTeamId(10L);

        when(participantRepository.findByCompetitionId(1L)).thenReturn(List.of());
        when(teamService.getTeamsWithMembers(1L)).thenReturn(List.of(team));

        competitionService.deleteCompetition(1L);

        verify(teamService).deleteTeamWithMembers(10L);
        verify(competitionRepository).deleteById(1L);
    }

    // ===== REGISTER PARTICIPANT (logique métier complexe) =====

    @Test
    void registerParticipant_shouldSucceedWhenAllConditionsMet() {
        when(competitionRepository.findById(1L)).thenReturn(Optional.of(openCompetition));
        when(participantRepository.findByUserIdAndCompetitionId(11L, 1L)).thenReturn(Optional.empty());
        when(participantRepository.countByCompetitionId(1L)).thenReturn(5L);
        when(participantRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Participant result = competitionService.registerParticipant(11L, 1L);

        assertNotNull(result);
        assertEquals(11L, result.getUserId());
        assertEquals(1L, result.getCompetitionId());
        assertEquals(Participant.ParticipantStatus.REGISTERED, result.getStatus());
        assertNotNull(result.getRegistrationDate());
    }

    @Test
    void registerParticipant_shouldThrowWhenCompetitionClosed() {
        when(competitionRepository.findById(2L)).thenReturn(Optional.of(closedCompetition));

        assertThrows(RuntimeException.class, () ->
                competitionService.registerParticipant(11L, 2L));
        verify(participantRepository, never()).save(any());
    }

    @Test
    void registerParticipant_shouldThrowWhenAlreadyRegistered() {
        when(competitionRepository.findById(1L)).thenReturn(Optional.of(openCompetition));
        when(participantRepository.findByUserIdAndCompetitionId(11L, 1L))
                .thenReturn(Optional.of(new Participant()));

        assertThrows(RuntimeException.class, () ->
                competitionService.registerParticipant(11L, 1L));
    }

    @Test
    void registerParticipant_shouldThrowWhenMaxReached() {
        when(competitionRepository.findById(1L)).thenReturn(Optional.of(openCompetition));
        when(participantRepository.findByUserIdAndCompetitionId(11L, 1L)).thenReturn(Optional.empty());
        when(participantRepository.countByCompetitionId(1L)).thenReturn(10L); // max atteint

        assertThrows(RuntimeException.class, () ->
                competitionService.registerParticipant(11L, 1L));
    }

    @Test
    void registerParticipant_shouldAllowWhenNoMaxLimit() {
        openCompetition.setMaxParticipants(null); // pas de limite
        when(competitionRepository.findById(1L)).thenReturn(Optional.of(openCompetition));
        when(participantRepository.findByUserIdAndCompetitionId(11L, 1L)).thenReturn(Optional.empty());
        when(participantRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Participant result = competitionService.registerParticipant(11L, 1L);

        assertNotNull(result);
    }

    // ===== CANCEL REGISTRATION =====

    @Test
    void cancelRegistration_shouldDeleteParticipant() {
        Participant participant = new Participant();
        when(participantRepository.findByUserIdAndCompetitionId(11L, 1L))
                .thenReturn(Optional.of(participant));

        competitionService.cancelRegistration(11L, 1L);

        verify(participantRepository).delete(participant);
    }

    @Test
    void cancelRegistration_shouldThrowWhenNotRegistered() {
        when(participantRepository.findByUserIdAndCompetitionId(11L, 1L))
                .thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () ->
                competitionService.cancelRegistration(11L, 1L));
    }

    // ===== GET PARTICIPANTS =====

    @Test
    void getCompetitionParticipants_shouldReturnAllParticipants() {
        Participant p1 = new Participant(); p1.setUserId(11L);
        Participant p2 = new Participant(); p2.setUserId(12L);
        when(participantRepository.findByCompetitionId(1L)).thenReturn(List.of(p1, p2));

        List<Participant> result = competitionService.getCompetitionParticipants(1L);

        assertEquals(2, result.size());
    }

    @Test
    void getUserParticipations_shouldReturnUserCompetitions() {
        Participant p = new Participant();
        p.setCompetitionId(1L);
        when(participantRepository.findByUserId(11L)).thenReturn(List.of(p));

        List<Participant> result = competitionService.getUserParticipations(11L);

        assertEquals(1, result.size());
    }

    // ===== UPDATE SCORE =====

    @Test
    void updateParticipantScore_shouldUpdateScoreAndRank() {
        Participant participant = new Participant();
        participant.setUserId(11L);
        when(participantRepository.findById(1L)).thenReturn(Optional.of(participant));
        when(participantRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Participant result = competitionService.updateParticipantScore(1L, 95, 1);

        assertEquals(95, result.getScore());
        assertEquals(1, result.getRank());
    }

    @Test
    void updateParticipantScore_shouldThrowWhenParticipantNotFound() {
        when(participantRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () ->
                competitionService.updateParticipantScore(99L, 100, 1));
    }

    // ===== MY PARTICIPATIONS (logique complexe: INDIVIDUAL + TEAM) =====

    @Test
    void getMyParticipations_shouldMergeIndividualAndTeamCompetitions() {
        Participant p = new Participant();
        p.setCompetitionId(1L);

        when(participantRepository.findByUserId(11L)).thenReturn(List.of(p));
        when(competitionRepository.findById(1L)).thenReturn(Optional.of(openCompetition));
        when(teamService.getCompetitionsWhereUserIsInTeam(11L)).thenReturn(List.of(teamCompetition));

        List<Competition> result = competitionService.getMyParticipations(11L);

        assertEquals(2, result.size()); // 1 individual + 1 team
    }

    @Test
    void getMyParticipations_shouldAvoidDuplicates() {
        Participant p = new Participant();
        p.setCompetitionId(1L);

        when(participantRepository.findByUserId(11L)).thenReturn(List.of(p));
        when(competitionRepository.findById(1L)).thenReturn(Optional.of(openCompetition));
        // même compétition dans les deux listes
        when(teamService.getCompetitionsWhereUserIsInTeam(11L)).thenReturn(List.of(openCompetition));

        List<Competition> result = competitionService.getMyParticipations(11L);

        assertEquals(1, result.size()); // pas de doublon
    }

    // ===== GET MY REGISTRATION =====

    @Test
    void getMyRegistration_shouldReturnParticipantIfExists() {
        Participant p = new Participant();
        when(participantRepository.findByUserIdAndCompetitionId(11L, 1L)).thenReturn(Optional.of(p));

        Optional<Participant> result = competitionService.getMyRegistration(11L, 1L);

        assertTrue(result.isPresent());
    }

    @Test
    void getMyRegistration_shouldReturnEmptyIfNotRegistered() {
        when(participantRepository.findByUserIdAndCompetitionId(11L, 99L)).thenReturn(Optional.empty());

        Optional<Participant> result = competitionService.getMyRegistration(11L, 99L);

        assertFalse(result.isPresent());
    }
}
