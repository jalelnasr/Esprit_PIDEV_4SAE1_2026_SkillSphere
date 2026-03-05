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

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CompetitionServiceTest {

    @Mock
    private CompetitionRepository competitionRepository;

    @Mock
    private ParticipantRepository participantRepository;

    @InjectMocks
    private CompetitionService competitionService;

    private Competition testCompetition;
    private Participant testParticipant;

    @BeforeEach
    public void setUp() {
        testCompetition = new Competition();
        testCompetition.setCompetitionId(1L);
        testCompetition.setTitle("Java Coding Challenge");
        testCompetition.setDescription("A challenging Java programming competition");
        testCompetition.setType(Competition.CompetitionType.ONLINE);
        testCompetition.setStartDate(LocalDateTime.now().plusDays(1));
        testCompetition.setEndDate(LocalDateTime.now().plusDays(2));
        testCompetition.setMaxParticipants(100);
        testCompetition.setStatus(Competition.CompetitionStatus.OPEN);

        testParticipant = new Participant();
        testParticipant.setRegistrationId(1L);
        testParticipant.setUserId(1L);
        testParticipant.setCompetitionId(1L);
        testParticipant.setRegistrationDate(LocalDateTime.now());
        testParticipant.setStatus(Participant.ParticipantStatus.REGISTERED);
    }

    @Test
    public void testCreateCompetition() {
        when(competitionRepository.save(any(Competition.class))).thenReturn(testCompetition);

        Competition createdCompetition = competitionService.createCompetition(testCompetition);

        assertNotNull(createdCompetition);
        assertEquals("Java Coding Challenge", createdCompetition.getTitle());
        assertEquals(Competition.CompetitionStatus.OPEN, createdCompetition.getStatus());
        verify(competitionRepository, times(1)).save(any(Competition.class));
    }

    @Test
    public void testCreateCompetitionWithNullStatus() {
        testCompetition.setStatus(null);
        when(competitionRepository.save(any(Competition.class))).thenReturn(testCompetition);

        Competition createdCompetition = competitionService.createCompetition(testCompetition);

        assertNotNull(createdCompetition);
        verify(competitionRepository, times(1)).save(any(Competition.class));
    }

    @Test
    public void testRegisterParticipantSuccess() {
        when(competitionRepository.findById(1L)).thenReturn(Optional.of(testCompetition));
        when(participantRepository.findByUserIdAndCompetitionId(1L, 1L)).thenReturn(Optional.empty());
        when(participantRepository.findByCompetitionId(1L)).thenReturn(new ArrayList<>());
        when(participantRepository.save(any(Participant.class))).thenReturn(testParticipant);

        Participant registeredParticipant = competitionService.registerParticipant(1L, 1L);

        assertNotNull(registeredParticipant);
        assertEquals(1L, registeredParticipant.getUserId());
        assertEquals(Participant.ParticipantStatus.REGISTERED, registeredParticipant.getStatus());
        verify(participantRepository, times(1)).save(any(Participant.class));
    }

    @Test
    public void testRegisterParticipantCompetitionNotFound() {
        when(competitionRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> {
            competitionService.registerParticipant(1L, 1L);
        });

        verify(participantRepository, never()).save(any(Participant.class));
    }

    @Test
    public void testRegisterParticipantAlreadyRegistered() {
        when(competitionRepository.findById(1L)).thenReturn(Optional.of(testCompetition));
        when(participantRepository.findByUserIdAndCompetitionId(1L, 1L)).thenReturn(Optional.of(testParticipant));

        assertThrows(RuntimeException.class, () -> {
            competitionService.registerParticipant(1L, 1L);
        });

        verify(participantRepository, never()).save(any(Participant.class));
    }

    @Test
    public void testRegisterParticipantMaxParticipantsReached() {
        testCompetition.setMaxParticipants(1);
        List<Participant> participants = new ArrayList<>();
        participants.add(testParticipant);

        when(competitionRepository.findById(1L)).thenReturn(Optional.of(testCompetition));
        when(participantRepository.findByUserIdAndCompetitionId(1L, 1L)).thenReturn(Optional.empty());
        when(participantRepository.findByCompetitionId(1L)).thenReturn(participants);

        assertThrows(RuntimeException.class, () -> {
            competitionService.registerParticipant(1L, 1L);
        });

        verify(participantRepository, never()).save(any(Participant.class));
    }

    @Test
    public void testGetAllCompetitions() {
        List<Competition> competitionList = new ArrayList<>();
        competitionList.add(testCompetition);

        when(competitionRepository.findAll()).thenReturn(competitionList);

        List<Competition> competitions = competitionService.getAllCompetitions();

        assertNotNull(competitions);
        assertEquals(1, competitions.size());
        assertEquals("Java Coding Challenge", competitions.get(0).getTitle());
        verify(competitionRepository, times(1)).findAll();
    }

    @Test
    public void testGetCompetitionById() {
        when(competitionRepository.findById(1L)).thenReturn(Optional.of(testCompetition));

        Optional<Competition> competition = competitionService.getCompetitionById(1L);

        assertTrue(competition.isPresent());
        assertEquals("Java Coding Challenge", competition.get().getTitle());
        verify(competitionRepository, times(1)).findById(1L);
    }

    @Test
    public void testUpdateParticipantScore() {
        when(participantRepository.findById(1L)).thenReturn(Optional.of(testParticipant));
        when(participantRepository.save(any(Participant.class))).thenReturn(testParticipant);

        Participant updatedParticipant = competitionService.updateParticipantScore(1L, 95, 1);

        assertNotNull(updatedParticipant);
        verify(participantRepository, times(1)).findById(1L);
        verify(participantRepository, times(1)).save(any(Participant.class));
    }

    @Test
    public void testGetCompetitionParticipants() {
        List<Participant> participantList = new ArrayList<>();
        participantList.add(testParticipant);

        when(participantRepository.findByCompetitionId(1L)).thenReturn(participantList);

        List<Participant> participants = competitionService.getCompetitionParticipants(1L);

        assertNotNull(participants);
        assertEquals(1, participants.size());
        verify(participantRepository, times(1)).findByCompetitionId(1L);
    }

    @Test
    public void testDeleteCompetition() {
        doNothing().when(competitionRepository).deleteById(1L);

        competitionService.deleteCompetition(1L);

        verify(competitionRepository, times(1)).deleteById(1L);
    }
}

