package org.example.professional_events.service;

import org.example.professional_events.entity.Competition;
import org.example.professional_events.entity.Participant;
import org.example.professional_events.repository.CompetitionRepository;
import org.example.professional_events.repository.ParticipantRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CompetitionServiceTest {

    @Mock
    private CompetitionRepository competitionRepository;

    @Mock
    private ParticipantRepository participantRepository;

    @Mock
    private TeamService teamService;

    @Mock
    private org.example.professional_events.repository.UserContactRepository userContactRepository;

    @Mock
    private org.example.professional_events.repository.TeamMemberRepository teamMemberRepository;

    @InjectMocks
    private CompetitionService competitionService;

    private Competition competition;

    @BeforeEach
    void setUp() {
        competition = new Competition();
        competition.setCompetitionId(1L);
        competition.setTitle("Hackathon 2026");
        competition.setStatus(Competition.CompetitionStatus.OPEN);
        competition.setParticipationType(Competition.ParticipationType.INDIVIDUAL);
        competition.setMaxParticipants(10);
    }

    @Test
    void createCompetition_shouldSaveAndReturn() {
        when(competitionRepository.save(any(Competition.class))).thenReturn(competition);

        Competition result = competitionService.createCompetition(competition);

        assertNotNull(result);
        assertEquals("Hackathon 2026", result.getTitle());
        verify(competitionRepository, times(1)).save(competition);
    }

    @Test
    void getAllCompetitions_shouldReturnList() {
        when(competitionRepository.findAll()).thenReturn(List.of(competition));

        List<Competition> result = competitionService.getAllCompetitions();

        assertEquals(1, result.size());
        assertEquals("Hackathon 2026", result.get(0).getTitle());
    }

    @Test
    void registerParticipant_shouldRegisterSuccessfully() {
        when(competitionRepository.findById(1L)).thenReturn(Optional.of(competition));
        when(participantRepository.findByUserIdAndCompetitionId(11L, 1L)).thenReturn(Optional.empty());
        when(participantRepository.countByCompetitionId(1L)).thenReturn(5L);
        when(participantRepository.save(any(Participant.class))).thenAnswer(inv -> inv.getArgument(0));

        Participant result = competitionService.registerParticipant(11L, 1L);

        assertNotNull(result);
        assertEquals(11L, result.getUserId());
        assertEquals(1L, result.getCompetitionId());
        assertEquals(Participant.ParticipantStatus.REGISTERED, result.getStatus());
    }

    @Test
    void registerParticipant_shouldThrowWhenAlreadyRegistered() {
        Participant existing = new Participant();
        when(competitionRepository.findById(1L)).thenReturn(Optional.of(competition));
        when(participantRepository.findByUserIdAndCompetitionId(11L, 1L)).thenReturn(Optional.of(existing));

        assertThrows(RuntimeException.class, () ->
                competitionService.registerParticipant(11L, 1L));
    }

    @Test
    void registerParticipant_shouldThrowWhenCompetitionClosed() {
        competition.setStatus(Competition.CompetitionStatus.CLOSED);
        when(competitionRepository.findById(1L)).thenReturn(Optional.of(competition));

        assertThrows(RuntimeException.class, () ->
                competitionService.registerParticipant(11L, 1L));
    }

    @Test
    void registerParticipant_shouldThrowWhenMaxParticipantsReached() {
        when(competitionRepository.findById(1L)).thenReturn(Optional.of(competition));
        when(participantRepository.findByUserIdAndCompetitionId(11L, 1L)).thenReturn(Optional.empty());
        when(participantRepository.countByCompetitionId(1L)).thenReturn(10L);

        assertThrows(RuntimeException.class, () ->
                competitionService.registerParticipant(11L, 1L));
    }

    @Test
    void deleteCompetition_shouldDeleteParticipantsAndCompetition() {
        when(participantRepository.findByCompetitionId(1L)).thenReturn(List.of());
        when(teamService.getTeamsWithMembers(1L)).thenReturn(List.of());

        competitionService.deleteCompetition(1L);

        verify(competitionRepository, times(1)).deleteById(1L);
    }

    @Test
    void getCompetitionById_shouldReturnCompetition() {
        when(competitionRepository.findById(1L)).thenReturn(Optional.of(competition));

        Optional<Competition> result = competitionService.getCompetitionById(1L);

        assertTrue(result.isPresent());
        assertEquals(1L, result.get().getCompetitionId());
    }
}
