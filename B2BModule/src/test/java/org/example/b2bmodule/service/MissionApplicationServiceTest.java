package org.example.b2bmodule.service;

import org.example.b2bmodule.dto.MissionApplicationRequest;
import org.example.b2bmodule.dto.MissionApplicationResponse;
import org.example.b2bmodule.entity.*;
import org.example.b2bmodule.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MissionApplicationServiceTest {

    @Mock
    private MissionApplicationRepository missionAppRepository;

    @Mock
    private MissionRepository missionRepository;

    @Mock
    private CandidateRepository candidateRepository;

    @Mock
    private CandidateMatchingService matchingService;

    @InjectMocks
    private MissionApplicationService applicationService;

    private Mission mission;
    private Candidate candidate;
    private MissionApplication application;
    private Company company;

    @BeforeEach
    void setUp() {
        company = Company.builder()
                .id(1L)
                .name("Tech Corp")
                .build();

        mission = Mission.builder()
                .id(1L)
                .title("Frontend Developer")
                .description("Build React apps")
                .company(company)
                .dailyRate(new BigDecimal("500"))
                .durationWeeks(12)
                .requiredSkills("React,TypeScript")
                .status(Mission.MissionStatus.OPEN)
                .build();

        candidate = Candidate.builder()
                .id(1L)
                .title("Senior Frontend Developer")
                .skills("React,TypeScript,JavaScript")
                .experienceYears(5)
                .isLookingForJob(true)
                .build();

        application = MissionApplication.builder()
                .id(1L)
                .mission(mission)
                .candidate(candidate)
                .proposedRate(new BigDecimal("480"))
                .status(MissionApplication.MissionAppStatus.PENDING)
                .build();
    }

    @Test
    void shouldApplyToMission() {
        // Given
        MissionApplicationRequest request = new MissionApplicationRequest(
                1L, 1L, new BigDecimal("480")
        );

        when(missionAppRepository.findByMissionIdAndCandidateId(1L, 1L)).thenReturn(Optional.empty());
        when(missionRepository.findById(1L)).thenReturn(Optional.of(mission));
        when(candidateRepository.findById(1L)).thenReturn(Optional.of(candidate));
        when(missionAppRepository.save(any(MissionApplication.class))).thenReturn(application);
        when(matchingService.calculateMatchingScore(any(), any(), any())).thenReturn(85);
        when(matchingService.getMatchingRecommendation(anyInt(), any(), any())).thenReturn("Excellent match");

        // When
        MissionApplicationResponse response = applicationService.apply(request);

        // Then
        assertNotNull(response);
        assertEquals(1L, response.id());
        assertEquals(1L, response.missionId());
        assertEquals(1L, response.candidateId());
        assertEquals(new BigDecimal("480"), response.proposedRate());
        assertEquals(85, response.matchingScore());
        verify(missionAppRepository).save(any(MissionApplication.class));
    }

    @Test
    void shouldThrowExceptionWhenAlreadyApplied() {
        // Given
        MissionApplicationRequest request = new MissionApplicationRequest(
                1L, 1L, new BigDecimal("480")
        );

        when(missionAppRepository.findByMissionIdAndCandidateId(1L, 1L)).thenReturn(Optional.of(application));

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            applicationService.apply(request);
        });
        assertEquals("Already applied", exception.getMessage());
        verify(missionAppRepository, never()).save(any());
    }

    @Test
    void shouldAutoCreateCandidateIfNotExists() {
        // Given
        MissionApplicationRequest request = new MissionApplicationRequest(
                1L, 999L, new BigDecimal("480")
        );

        Candidate newCandidate = Candidate.builder()
                .id(999L)
                .title("Freelancer")
                .skills("")
                .experienceYears(0)
                .isLookingForJob(true)
                .build();

        when(missionAppRepository.findByMissionIdAndCandidateId(1L, 999L)).thenReturn(Optional.empty());
        when(missionRepository.findById(1L)).thenReturn(Optional.of(mission));
        when(candidateRepository.findById(999L)).thenReturn(Optional.empty());
        when(candidateRepository.save(any(Candidate.class))).thenReturn(newCandidate);
        when(missionAppRepository.save(any(MissionApplication.class))).thenReturn(application);
        when(matchingService.calculateMatchingScore(any(), any(), any())).thenReturn(50);
        when(matchingService.getMatchingRecommendation(anyInt(), any(), any())).thenReturn("Moderate match");

        // When
        MissionApplicationResponse response = applicationService.apply(request);

        // Then
        assertNotNull(response);
        verify(candidateRepository).save(any(Candidate.class));
        verify(missionAppRepository).save(any(MissionApplication.class));
    }

    @Test
    void shouldThrowExceptionWhenMissionNotFound() {
        // Given
        MissionApplicationRequest request = new MissionApplicationRequest(
                999L, 1L, new BigDecimal("480")
        );

        when(missionAppRepository.findByMissionIdAndCandidateId(999L, 1L)).thenReturn(Optional.empty());
        when(missionRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            applicationService.apply(request);
        });
        assertEquals("Mission not found", exception.getMessage());
    }

    @Test
    void shouldFindApplicationsByMission() {
        // Given
        when(missionAppRepository.findByMissionId(1L)).thenReturn(List.of(application));
        when(matchingService.calculateMatchingScore(any(), any(), any())).thenReturn(85);
        when(matchingService.getMatchingRecommendation(anyInt(), any(), any())).thenReturn("Excellent match");

        // When
        List<MissionApplicationResponse> applications = applicationService.findByMission(1L);

        // Then
        assertNotNull(applications);
        assertEquals(1, applications.size());
        assertEquals(1L, applications.get(0).missionId());
    }

    @Test
    void shouldFindApplicationsByCandidate() {
        // Given
        when(missionAppRepository.findByCandidateId(1L)).thenReturn(List.of(application));
        when(matchingService.calculateMatchingScore(any(), any(), any())).thenReturn(85);
        when(matchingService.getMatchingRecommendation(anyInt(), any(), any())).thenReturn("Excellent match");

        // When
        List<MissionApplicationResponse> applications = applicationService.findByCandidate(1L);

        // Then
        assertNotNull(applications);
        assertEquals(1, applications.size());
        assertEquals(1L, applications.get(0).candidateId());
    }

    @Test
    void shouldFindApplicationById() {
        // Given
        when(missionAppRepository.findById(1L)).thenReturn(Optional.of(application));
        when(matchingService.calculateMatchingScore(any(), any(), any())).thenReturn(85);
        when(matchingService.getMatchingRecommendation(anyInt(), any(), any())).thenReturn("Excellent match");

        // When
        MissionApplicationResponse response = applicationService.findById(1L);

        // Then
        assertNotNull(response);
        assertEquals(1L, response.id());
        assertEquals(85, response.matchingScore());
    }

    @Test
    void shouldUpdateApplicationStatus() {
        // Given
        when(missionAppRepository.findById(1L)).thenReturn(Optional.of(application));
        when(missionAppRepository.save(any(MissionApplication.class))).thenReturn(application);
        when(matchingService.calculateMatchingScore(any(), any(), any())).thenReturn(85);
        when(matchingService.getMatchingRecommendation(anyInt(), any(), any())).thenReturn("Excellent match");

        // When
        MissionApplicationResponse response = applicationService.updateStatus(1L, "ACCEPTED");

        // Then
        assertNotNull(response);
        verify(missionAppRepository).save(argThat(app -> 
            app.getStatus() == MissionApplication.MissionAppStatus.ACCEPTED
        ));
    }

    @Test
    void shouldDeleteApplication() {
        // When
        applicationService.delete(1L);

        // Then
        verify(missionAppRepository).deleteById(1L);
    }

    @Test
    void shouldGetDetailedMatchingAnalysis() {
        // Given
        when(missionAppRepository.findById(1L)).thenReturn(Optional.of(application));
        when(matchingService.calculateMatchingScore(any(), any(), any())).thenReturn(85);
        when(matchingService.getMatchingRecommendation(anyInt(), any(), any())).thenReturn("Excellent match");
        when(matchingService.getDetailedAnalysis(any(), any(), any())).thenReturn("Skills: 3/3 matched | Experience: 5 years | Rate: Exact match");
        when(matchingService.getScoreBadgeClass(85)).thenReturn("excellent");

        // When
        Map<String, Object> analysis = applicationService.getDetailedMatchingAnalysis(1L);

        // Then
        assertNotNull(analysis);
        assertEquals(85, analysis.get("score"));
        assertEquals("Excellent match", analysis.get("recommendation"));
        assertEquals("excellent", analysis.get("badgeClass"));
        assertTrue(analysis.containsKey("detailedAnalysis"));
        assertTrue(analysis.containsKey("candidateName"));
        assertTrue(analysis.containsKey("missionTitle"));
    }

    @Test
    void shouldThrowExceptionWhenApplicationNotFoundForAnalysis() {
        // Given
        when(missionAppRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            applicationService.getDetailedMatchingAnalysis(999L);
        });
        assertEquals("Application not found", exception.getMessage());
    }

    @Test
    void shouldCalculateMatchingScoreForEachApplication() {
        // Given
        when(missionAppRepository.findByMissionId(1L)).thenReturn(List.of(application));
        when(matchingService.calculateMatchingScore(any(), any(), any())).thenReturn(85);
        when(matchingService.getMatchingRecommendation(anyInt(), any(), any())).thenReturn("Excellent match");

        // When
        List<MissionApplicationResponse> applications = applicationService.findByMission(1L);

        // Then
        assertNotNull(applications);
        assertEquals(1, applications.size());
        assertEquals(85, applications.get(0).matchingScore());
        assertEquals("Excellent match", applications.get(0).matchingRecommendation());
        verify(matchingService).calculateMatchingScore(any(), any(), any());
        verify(matchingService).getMatchingRecommendation(anyInt(), any(), any());
    }
}
