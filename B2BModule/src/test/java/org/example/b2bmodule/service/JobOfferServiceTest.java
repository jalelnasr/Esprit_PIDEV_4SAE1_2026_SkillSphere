package org.example.b2bmodule.service;

import org.example.b2bmodule.dto.JobOfferRequest;
import org.example.b2bmodule.dto.JobOfferResponse;
import org.example.b2bmodule.entity.Company;
import org.example.b2bmodule.entity.JobOffer;
import org.example.b2bmodule.repository.CompanyRepository;
import org.example.b2bmodule.repository.JobOfferRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobOfferServiceTest {

    @Mock
    private JobOfferRepository jobOfferRepository;

    @Mock
    private CompanyRepository companyRepository;

    @InjectMocks
    private JobOfferService jobOfferService;

    private Company company;
    private JobOffer jobOffer;
    private JobOfferRequest request;

    @BeforeEach
    void setUp() {
        company = Company.builder()
                .id(1L)
                .name("Tech Corp")
                .email("contact@techcorp.com")
                .siret("12345678901234")
                .sector("IT")
                .address("123 Main St")
                .phone("+33123456789")
                .creditsRemaining(100)
                .build();

        jobOffer = JobOffer.builder()
                .id(1L)
                .company(company)
                .title("Senior Frontend Developer")
                .description("Build modern React applications")
                .contractType("CDI")
                .location("Paris, France")
                .requiredSkills("React,TypeScript,JavaScript")
                .status(JobOffer.JobOfferStatus.OPEN)
                .postedAt(Instant.now())
                .build();

        request = new JobOfferRequest(
                1L,
                "Senior Frontend Developer",
                "Build modern React applications",
                "CDI",
                "Paris, France",
                "React,TypeScript,JavaScript"
        );
    }

    @Test
    void shouldCreateJobOffer() {
        // Given
        when(companyRepository.findById(1L)).thenReturn(Optional.of(company));
        when(jobOfferRepository.save(any(JobOffer.class))).thenReturn(jobOffer);

        // When
        JobOfferResponse response = jobOfferService.create(request);

        // Then
        assertNotNull(response);
        assertEquals(1L, response.id());
        assertEquals("Senior Frontend Developer", response.title());
        assertEquals("Tech Corp", response.companyName());
        assertEquals("CDI", response.contractType());
        assertEquals("Paris, France", response.location());
        verify(jobOfferRepository).save(any(JobOffer.class));
    }

    @Test
    void shouldThrowExceptionWhenCompanyNotFound() {
        // Given
        when(companyRepository.findById(999L)).thenReturn(Optional.empty());
        JobOfferRequest invalidRequest = new JobOfferRequest(
                999L, "Developer", "Description", "CDI", "Paris", "Java"
        );

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            jobOfferService.create(invalidRequest);
        });
        assertEquals("Company not found", exception.getMessage());
    }

    @Test
    void shouldFindAllJobOffers() {
        // Given
        JobOffer jobOffer2 = JobOffer.builder()
                .id(2L)
                .company(company)
                .title("Backend Developer")
                .description("Build APIs")
                .contractType("CDD")
                .location("Lyon, France")
                .requiredSkills("Java,Spring")
                .status(JobOffer.JobOfferStatus.OPEN)
                .postedAt(Instant.now())
                .build();

        when(jobOfferRepository.findAll()).thenReturn(List.of(jobOffer, jobOffer2));

        // When
        List<JobOfferResponse> jobOffers = jobOfferService.findAll();

        // Then
        assertNotNull(jobOffers);
        assertEquals(2, jobOffers.size());
        assertEquals("Senior Frontend Developer", jobOffers.get(0).title());
        assertEquals("Backend Developer", jobOffers.get(1).title());
    }

    @Test
    void shouldFindJobOfferById() {
        // Given
        when(jobOfferRepository.findById(1L)).thenReturn(Optional.of(jobOffer));

        // When
        JobOfferResponse response = jobOfferService.findById(1L);

        // Then
        assertNotNull(response);
        assertEquals(1L, response.id());
        assertEquals("Senior Frontend Developer", response.title());
    }

    @Test
    void shouldThrowExceptionWhenJobOfferNotFound() {
        // Given
        when(jobOfferRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            jobOfferService.findById(999L);
        });
        assertEquals("JobOffer not found", exception.getMessage());
    }

    @Test
    void shouldFindJobOffersByCompany() {
        // Given
        when(jobOfferRepository.findByCompanyId(1L)).thenReturn(List.of(jobOffer));

        // When
        List<JobOfferResponse> jobOffers = jobOfferService.findByCompany(1L);

        // Then
        assertNotNull(jobOffers);
        assertEquals(1, jobOffers.size());
        assertEquals(1L, jobOffers.get(0).companyId());
    }

    @Test
    void shouldFindOpenJobOffers() {
        // Given
        when(jobOfferRepository.findByStatus(JobOffer.JobOfferStatus.OPEN))
                .thenReturn(List.of(jobOffer));

        // When
        List<JobOfferResponse> openJobOffers = jobOfferService.findOpen();

        // Then
        assertNotNull(openJobOffers);
        assertEquals(1, openJobOffers.size());
        assertEquals("OPEN", openJobOffers.get(0).status());
    }

    @Test
    void shouldSearchJobOffersBySkill() {
        // Given
        when(jobOfferRepository.findOpenBySkill("React")).thenReturn(List.of(jobOffer));

        // When
        List<JobOfferResponse> jobOffers = jobOfferService.searchBySkill("React");

        // Then
        assertNotNull(jobOffers);
        assertEquals(1, jobOffers.size());
        assertTrue(jobOffers.get(0).requiredSkills().contains("React"));
    }

    @Test
    void shouldUpdateJobOffer() {
        // Given
        JobOfferRequest updateRequest = new JobOfferRequest(
                1L,
                "Lead Frontend Developer",
                "Lead React team",
                "CDI",
                "Paris, France",
                "React,TypeScript,Leadership"
        );

        JobOffer updatedJobOffer = JobOffer.builder()
                .id(1L)
                .company(company)
                .title("Lead Frontend Developer")
                .description("Lead React team")
                .contractType("CDI")
                .location("Paris, France")
                .requiredSkills("React,TypeScript,Leadership")
                .status(JobOffer.JobOfferStatus.OPEN)
                .postedAt(Instant.now())
                .build();

        when(jobOfferRepository.findById(1L)).thenReturn(Optional.of(jobOffer));
        when(jobOfferRepository.save(any(JobOffer.class))).thenReturn(updatedJobOffer);

        // When
        JobOfferResponse response = jobOfferService.update(1L, updateRequest);

        // Then
        assertNotNull(response);
        assertEquals("Lead Frontend Developer", response.title());
        verify(jobOfferRepository).save(any(JobOffer.class));
    }

    @Test
    void shouldUpdateOnlyProvidedFields() {
        // Given
        JobOfferRequest partialUpdate = new JobOfferRequest(
                null, "Updated Title", null, null, null, null
        );

        when(jobOfferRepository.findById(1L)).thenReturn(Optional.of(jobOffer));
        when(jobOfferRepository.save(any(JobOffer.class))).thenReturn(jobOffer);

        // When
        JobOfferResponse response = jobOfferService.update(1L, partialUpdate);

        // Then
        assertNotNull(response);
        verify(jobOfferRepository).save(argThat(j -> 
            j.getTitle().equals("Updated Title") && 
            j.getDescription().equals("Build modern React applications")
        ));
    }

    @Test
    void shouldThrowExceptionWhenUpdatingNonExistentJobOffer() {
        // Given
        when(jobOfferRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            jobOfferService.update(999L, request);
        });
        assertEquals("JobOffer not found", exception.getMessage());
    }

    @Test
    void shouldUpdateJobOfferStatus() {
        // Given
        when(jobOfferRepository.findById(1L)).thenReturn(Optional.of(jobOffer));
        when(jobOfferRepository.save(any(JobOffer.class))).thenReturn(jobOffer);

        // When
        JobOfferResponse response = jobOfferService.updateStatus(1L, "CLOSED");

        // Then
        assertNotNull(response);
        verify(jobOfferRepository).save(argThat(j -> 
            j.getStatus() == JobOffer.JobOfferStatus.CLOSED
        ));
    }

    @Test
    void shouldThrowExceptionWhenUpdatingStatusOfNonExistentJobOffer() {
        // Given
        when(jobOfferRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            jobOfferService.updateStatus(999L, "CLOSED");
        });
        assertEquals("JobOffer not found", exception.getMessage());
    }

    @Test
    void shouldDeleteJobOffer() {
        // When
        jobOfferService.delete(1L);

        // Then
        verify(jobOfferRepository).deleteById(1L);
    }

    @Test
    void shouldReturnZeroApplicationsWhenNoApplications() {
        // Given
        jobOffer.setApplications(null);
        when(jobOfferRepository.findById(1L)).thenReturn(Optional.of(jobOffer));

        // When
        JobOfferResponse response = jobOfferService.findById(1L);

        // Then
        assertNotNull(response);
        assertEquals(0, response.applicationCount());
    }

    @Test
    void shouldReturnEmptyListWhenNoJobOffersForCompany() {
        // Given
        when(jobOfferRepository.findByCompanyId(999L)).thenReturn(List.of());

        // When
        List<JobOfferResponse> jobOffers = jobOfferService.findByCompany(999L);

        // Then
        assertNotNull(jobOffers);
        assertTrue(jobOffers.isEmpty());
    }

    @Test
    void shouldReturnEmptyListWhenNoOpenJobOffers() {
        // Given
        when(jobOfferRepository.findByStatus(JobOffer.JobOfferStatus.OPEN))
                .thenReturn(List.of());

        // When
        List<JobOfferResponse> openJobOffers = jobOfferService.findOpen();

        // Then
        assertNotNull(openJobOffers);
        assertTrue(openJobOffers.isEmpty());
    }

    @Test
    void shouldReturnEmptyListWhenNoMatchingSkill() {
        // Given
        when(jobOfferRepository.findOpenBySkill("Python")).thenReturn(List.of());

        // When
        List<JobOfferResponse> jobOffers = jobOfferService.searchBySkill("Python");

        // Then
        assertNotNull(jobOffers);
        assertTrue(jobOffers.isEmpty());
    }

    @Test
    void shouldHandleDifferentContractTypes() {
        // Given
        JobOfferRequest cddRequest = new JobOfferRequest(
                1L, "Developer", "Description", "CDD", "Paris", "Java"
        );
        JobOffer cddJobOffer = JobOffer.builder()
                .id(2L)
                .company(company)
                .title("Developer")
                .description("Description")
                .contractType("CDD")
                .location("Paris")
                .requiredSkills("Java")
                .status(JobOffer.JobOfferStatus.OPEN)
                .build();

        when(companyRepository.findById(1L)).thenReturn(Optional.of(company));
        when(jobOfferRepository.save(any(JobOffer.class))).thenReturn(cddJobOffer);

        // When
        JobOfferResponse response = jobOfferService.create(cddRequest);

        // Then
        assertNotNull(response);
        assertEquals("CDD", response.contractType());
    }

    @Test
    void shouldHandleMultipleSkills() {
        // Given
        JobOfferRequest multiSkillRequest = new JobOfferRequest(
                1L, "Full Stack Developer", "Description", "CDI", "Paris", 
                "React,Node.js,TypeScript,MongoDB,Docker"
        );
        JobOffer multiSkillJobOffer = JobOffer.builder()
                .id(3L)
                .company(company)
                .title("Full Stack Developer")
                .description("Description")
                .contractType("CDI")
                .location("Paris")
                .requiredSkills("React,Node.js,TypeScript,MongoDB,Docker")
                .status(JobOffer.JobOfferStatus.OPEN)
                .build();

        when(companyRepository.findById(1L)).thenReturn(Optional.of(company));
        when(jobOfferRepository.save(any(JobOffer.class))).thenReturn(multiSkillJobOffer);

        // When
        JobOfferResponse response = jobOfferService.create(multiSkillRequest);

        // Then
        assertNotNull(response);
        assertTrue(response.requiredSkills().contains("React"));
        assertTrue(response.requiredSkills().contains("Docker"));
    }
}
