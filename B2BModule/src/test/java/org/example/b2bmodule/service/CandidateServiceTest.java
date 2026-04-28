package org.example.b2bmodule.service;

import org.example.b2bmodule.dto.CandidateRequest;
import org.example.b2bmodule.dto.CandidateResponse;
import org.example.b2bmodule.entity.Candidate;
import org.example.b2bmodule.repository.CandidateRepository;
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
class CandidateServiceTest {

    @Mock
    private CandidateRepository candidateRepository;

    @InjectMocks
    private CandidateService candidateService;

    private Candidate candidate;
    private CandidateRequest request;

    @BeforeEach
    void setUp() {
        candidate = Candidate.builder()
                .id(1L)
                .title("Senior Frontend Developer")
                .skills("React,TypeScript,JavaScript,Node.js")
                .experienceYears(5)
                .resumeUrl("https://example.com/resume.pdf")
                .isLookingForJob(true)
                .build();

        request = new CandidateRequest(
                1L,
                "Senior Frontend Developer",
                "React,TypeScript,JavaScript,Node.js",
                5,
                "https://example.com/resume.pdf",
                true
        );
    }

    @Test
    void shouldCreateCandidate() {
        // Given
        when(candidateRepository.save(any(Candidate.class))).thenReturn(candidate);

        // When
        CandidateResponse response = candidateService.create(request);

        // Then
        assertNotNull(response);
        assertEquals(1L, response.id());
        assertEquals("Senior Frontend Developer", response.title());
        assertEquals("React,TypeScript,JavaScript,Node.js", response.skills());
        assertEquals(5, response.experienceYears());
        assertTrue(response.isLookingForJob());
        verify(candidateRepository).save(any(Candidate.class));
    }

    @Test
    void shouldCreateCandidateWithDefaultLookingForJob() {
        // Given
        CandidateRequest requestWithoutLookingForJob = new CandidateRequest(
                1L, "Developer", "Java", 3, "resume.pdf", null
        );
        when(candidateRepository.save(any(Candidate.class))).thenReturn(candidate);

        // When
        CandidateResponse response = candidateService.create(requestWithoutLookingForJob);

        // Then
        assertNotNull(response);
        verify(candidateRepository).save(argThat(c -> c.getIsLookingForJob() == true));
    }

    @Test
    void shouldFindAllCandidates() {
        // Given
        Candidate candidate2 = Candidate.builder()
                .id(2L)
                .title("Backend Developer")
                .skills("Java,Spring")
                .experienceYears(3)
                .isLookingForJob(true)
                .build();

        when(candidateRepository.findAll()).thenReturn(List.of(candidate, candidate2));

        // When
        List<CandidateResponse> candidates = candidateService.findAll();

        // Then
        assertNotNull(candidates);
        assertEquals(2, candidates.size());
        assertEquals("Senior Frontend Developer", candidates.get(0).title());
        assertEquals("Backend Developer", candidates.get(1).title());
    }

    @Test
    void shouldFindCandidateById() {
        // Given
        when(candidateRepository.findById(1L)).thenReturn(Optional.of(candidate));

        // When
        CandidateResponse response = candidateService.findById(1L);

        // Then
        assertNotNull(response);
        assertEquals(1L, response.id());
        assertEquals("Senior Frontend Developer", response.title());
    }

    @Test
    void shouldThrowExceptionWhenCandidateNotFound() {
        // Given
        when(candidateRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            candidateService.findById(999L);
        });
        assertEquals("Candidate not found", exception.getMessage());
    }

    @Test
    void shouldFindActiveCandidates() {
        // Given
        when(candidateRepository.findByIsLookingForJobTrue()).thenReturn(List.of(candidate));

        // When
        List<CandidateResponse> activeCandidates = candidateService.findActive();

        // Then
        assertNotNull(activeCandidates);
        assertEquals(1, activeCandidates.size());
        assertTrue(activeCandidates.get(0).isLookingForJob());
    }

    @Test
    void shouldFindCandidatesBySkill() {
        // Given
        when(candidateRepository.findBySkill("React")).thenReturn(List.of(candidate));

        // When
        List<CandidateResponse> candidates = candidateService.findBySkill("React");

        // Then
        assertNotNull(candidates);
        assertEquals(1, candidates.size());
        assertTrue(candidates.get(0).skills().contains("React"));
    }

    @Test
    void shouldUpdateCandidate() {
        // Given
        CandidateRequest updateRequest = new CandidateRequest(
                1L,
                "Lead Frontend Developer",
                "React,TypeScript,Vue.js",
                7,
                "https://example.com/new-resume.pdf",
                true
        );

        Candidate updatedCandidate = Candidate.builder()
                .id(1L)
                .title("Lead Frontend Developer")
                .skills("React,TypeScript,Vue.js")
                .experienceYears(7)
                .resumeUrl("https://example.com/new-resume.pdf")
                .isLookingForJob(true)
                .build();

        when(candidateRepository.findById(1L)).thenReturn(Optional.of(candidate));
        when(candidateRepository.save(any(Candidate.class))).thenReturn(updatedCandidate);

        // When
        CandidateResponse response = candidateService.update(1L, updateRequest);

        // Then
        assertNotNull(response);
        assertEquals("Lead Frontend Developer", response.title());
        assertEquals(7, response.experienceYears());
        verify(candidateRepository).save(any(Candidate.class));
    }

    @Test
    void shouldUpdateOnlyProvidedFields() {
        // Given
        CandidateRequest partialUpdate = new CandidateRequest(
                null, "Updated Title", null, null, null, null
        );

        when(candidateRepository.findById(1L)).thenReturn(Optional.of(candidate));
        when(candidateRepository.save(any(Candidate.class))).thenReturn(candidate);

        // When
        CandidateResponse response = candidateService.update(1L, partialUpdate);

        // Then
        assertNotNull(response);
        verify(candidateRepository).save(argThat(c -> 
            c.getTitle().equals("Updated Title") && 
            c.getSkills().equals("React,TypeScript,JavaScript,Node.js")
        ));
    }

    @Test
    void shouldThrowExceptionWhenUpdatingNonExistentCandidate() {
        // Given
        when(candidateRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            candidateService.update(999L, request);
        });
        assertEquals("Candidate not found", exception.getMessage());
    }

    @Test
    void shouldDeleteCandidate() {
        // When
        candidateService.delete(1L);

        // Then
        verify(candidateRepository).deleteById(1L);
    }

    @Test
    void shouldHandleEmptySkills() {
        // Given
        CandidateRequest requestWithEmptySkills = new CandidateRequest(
                1L, "Junior Developer", "", 1, "resume.pdf", true
        );
        Candidate candidateWithEmptySkills = Candidate.builder()
                .id(1L)
                .title("Junior Developer")
                .skills("")
                .experienceYears(1)
                .isLookingForJob(true)
                .build();

        when(candidateRepository.save(any(Candidate.class))).thenReturn(candidateWithEmptySkills);

        // When
        CandidateResponse response = candidateService.create(requestWithEmptySkills);

        // Then
        assertNotNull(response);
        assertEquals("", response.skills());
    }

    @Test
    void shouldHandleZeroExperience() {
        // Given
        CandidateRequest requestWithZeroExp = new CandidateRequest(
                1L, "Entry Level Developer", "Java", 0, "resume.pdf", true
        );
        Candidate candidateWithZeroExp = Candidate.builder()
                .id(1L)
                .title("Entry Level Developer")
                .skills("Java")
                .experienceYears(0)
                .isLookingForJob(true)
                .build();

        when(candidateRepository.save(any(Candidate.class))).thenReturn(candidateWithZeroExp);

        // When
        CandidateResponse response = candidateService.create(requestWithZeroExp);

        // Then
        assertNotNull(response);
        assertEquals(0, response.experienceYears());
    }

    @Test
    void shouldUpdateLookingForJobStatus() {
        // Given
        CandidateRequest updateRequest = new CandidateRequest(
                null, null, null, null, null, false
        );

        when(candidateRepository.findById(1L)).thenReturn(Optional.of(candidate));
        when(candidateRepository.save(any(Candidate.class))).thenReturn(candidate);

        // When
        candidateService.update(1L, updateRequest);

        // Then
        verify(candidateRepository).save(argThat(c -> c.getIsLookingForJob() == false));
    }

    @Test
    void shouldReturnEmptyListWhenNoActiveCandidates() {
        // Given
        when(candidateRepository.findByIsLookingForJobTrue()).thenReturn(List.of());

        // When
        List<CandidateResponse> activeCandidates = candidateService.findActive();

        // Then
        assertNotNull(activeCandidates);
        assertTrue(activeCandidates.isEmpty());
    }

    @Test
    void shouldReturnEmptyListWhenNoMatchingSkill() {
        // Given
        when(candidateRepository.findBySkill("Python")).thenReturn(List.of());

        // When
        List<CandidateResponse> candidates = candidateService.findBySkill("Python");

        // Then
        assertNotNull(candidates);
        assertTrue(candidates.isEmpty());
    }
}
