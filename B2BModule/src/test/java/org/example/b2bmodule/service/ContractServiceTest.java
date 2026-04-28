package org.example.b2bmodule.service;

import org.example.b2bmodule.dto.ContractRequest;
import org.example.b2bmodule.dto.ContractResponse;
import org.example.b2bmodule.entity.*;
import org.example.b2bmodule.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ContractServiceTest {

    @Mock
    private ContractRepository contractRepository;

    @Mock
    private MissionRepository missionRepository;

    @Mock
    private CandidateRepository candidateRepository;

    @Mock
    private CompanyRepository companyRepository;

    @InjectMocks
    private ContractService contractService;

    private Mission mission;
    private Candidate candidate;
    private Company company;
    private Contract contract;

    @BeforeEach
    void setUp() {
        // Setup test data
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

        contract = Contract.builder()
                .id(1L)
                .contractNumber("CTR-2024-001")
                .mission(mission)
                .candidate(candidate)
                .company(company)
                .totalAmount(new BigDecimal("60000"))
                .startDate(LocalDate.of(2024, 2, 1))
                .endDate(LocalDate.of(2024, 5, 1))
                .status(Contract.ContractStatus.DRAFT)
                .build();
    }

    @Test
    void shouldCreateContract() {
        // Given
        ContractRequest request = new ContractRequest(
                1L, 1L, 1L,
                new BigDecimal("60000"),
                LocalDate.of(2024, 2, 1),
                LocalDate.of(2024, 5, 1)
        );

        when(missionRepository.findById(1L)).thenReturn(Optional.of(mission));
        when(candidateRepository.findById(1L)).thenReturn(Optional.of(candidate));
        when(companyRepository.findById(1L)).thenReturn(Optional.of(company));
        when(contractRepository.findByMissionIdAndCandidateId(1L, 1L)).thenReturn(Optional.empty());
        when(contractRepository.save(any(Contract.class))).thenReturn(contract);

        // When
        ContractResponse response = contractService.create(request);

        // Then
        assertNotNull(response);
        assertEquals(1L, response.id());
        assertEquals("CTR-2024-001", response.contractNumber());
        assertEquals(new BigDecimal("60000"), response.totalAmount());
        verify(contractRepository).save(any(Contract.class));
    }

    @Test
    void shouldReturnExistingContractWhenAlreadyExists() {
        // Given
        ContractRequest request = new ContractRequest(
                1L, 1L, 1L,
                new BigDecimal("60000"),
                LocalDate.of(2024, 2, 1),
                LocalDate.of(2024, 5, 1)
        );

        when(missionRepository.findById(1L)).thenReturn(Optional.of(mission));
        when(candidateRepository.findById(1L)).thenReturn(Optional.of(candidate));
        when(companyRepository.findById(1L)).thenReturn(Optional.of(company));
        when(contractRepository.findByMissionIdAndCandidateId(1L, 1L)).thenReturn(Optional.of(contract));

        // When
        ContractResponse response = contractService.create(request);

        // Then
        assertNotNull(response);
        assertEquals(1L, response.id());
        verify(contractRepository, never()).save(any(Contract.class));
    }

    @Test
    void shouldThrowExceptionWhenMissionNotFound() {
        // Given
        ContractRequest request = new ContractRequest(
                999L, 1L, 1L,
                new BigDecimal("60000"),
                LocalDate.of(2024, 2, 1),
                LocalDate.of(2024, 5, 1)
        );

        when(missionRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            contractService.create(request);
        });
        assertEquals("Mission not found", exception.getMessage());
    }

    @Test
    void shouldFindAllContracts() {
        // Given
        when(contractRepository.findAll()).thenReturn(List.of(contract));

        // When
        List<ContractResponse> contracts = contractService.findAll();

        // Then
        assertNotNull(contracts);
        assertEquals(1, contracts.size());
        assertEquals("CTR-2024-001", contracts.get(0).contractNumber());
    }

    @Test
    void shouldFindContractById() {
        // Given
        when(contractRepository.findById(1L)).thenReturn(Optional.of(contract));

        // When
        ContractResponse response = contractService.findById(1L);

        // Then
        assertNotNull(response);
        assertEquals(1L, response.id());
        assertEquals("CTR-2024-001", response.contractNumber());
    }

    @Test
    void shouldFindContractsByCompany() {
        // Given
        when(contractRepository.findByCompanyId(1L)).thenReturn(List.of(contract));

        // When
        List<ContractResponse> contracts = contractService.findByCompany(1L);

        // Then
        assertNotNull(contracts);
        assertEquals(1, contracts.size());
        assertEquals(1L, contracts.get(0).companyId());
    }

    @Test
    void shouldFindContractsByCandidate() {
        // Given
        when(contractRepository.findByCandidateId(1L)).thenReturn(List.of(contract));

        // When
        List<ContractResponse> contracts = contractService.findByCandidate(1L);

        // Then
        assertNotNull(contracts);
        assertEquals(1, contracts.size());
        assertEquals(1L, contracts.get(0).candidateId());
    }

    @Test
    void shouldSignContract() {
        // Given
        when(contractRepository.findById(1L)).thenReturn(Optional.of(contract));
        when(contractRepository.save(any(Contract.class))).thenReturn(contract);

        // When
        ContractResponse response = contractService.sign(1L);

        // Then
        assertNotNull(response);
        verify(contractRepository).save(argThat(c -> 
            c.getStatus() == Contract.ContractStatus.SIGNED && c.getSignedAt() != null
        ));
    }

    @Test
    void shouldSignContractWithSignature() {
        // Given
        String signatureData = "data:image/png;base64,iVBORw0KGgo...";
        when(contractRepository.findById(1L)).thenReturn(Optional.of(contract));
        when(contractRepository.save(any(Contract.class))).thenReturn(contract);

        // When
        ContractResponse response = contractService.signWithSignature(1L, signatureData);

        // Then
        assertNotNull(response);
        verify(contractRepository).save(argThat(c -> 
            c.getStatus() == Contract.ContractStatus.SIGNED && 
            c.getSignedAt() != null &&
            c.getSignatureData() != null
        ));
    }

    @Test
    void shouldUpdateContractStatus() {
        // Given
        when(contractRepository.findById(1L)).thenReturn(Optional.of(contract));
        when(contractRepository.save(any(Contract.class))).thenReturn(contract);

        // When
        ContractResponse response = contractService.updateStatus(1L, "ACTIVE");

        // Then
        assertNotNull(response);
        verify(contractRepository).save(argThat(c -> 
            c.getStatus() == Contract.ContractStatus.ACTIVE
        ));
    }

    @Test
    void shouldDeleteContract() {
        // When
        contractService.delete(1L);

        // Then
        verify(contractRepository).deleteById(1L);
    }

    @Test
    void shouldThrowExceptionWhenContractNotFoundForSign() {
        // Given
        when(contractRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            contractService.sign(999L);
        });
        assertEquals("Contract not found", exception.getMessage());
    }
}
