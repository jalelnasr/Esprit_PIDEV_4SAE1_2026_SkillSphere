package org.example.b2bmodule.service;

import org.example.b2bmodule.dto.MissionRequest;
import org.example.b2bmodule.dto.MissionResponse;
import org.example.b2bmodule.entity.Company;
import org.example.b2bmodule.entity.Mission;
import org.example.b2bmodule.repository.CompanyRepository;
import org.example.b2bmodule.repository.MissionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

/**
 * Tests unitaires pour MissionService
 * 
 * Utilise Mockito pour mocker les dépendances (repositories)
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("MissionService - Tests Unitaires")
class MissionServiceTest {

    @Mock
    private MissionRepository missionRepository;

    @Mock
    private CompanyRepository companyRepository;

    @InjectMocks
    private MissionService missionService;

    private Company testCompany;
    private Mission testMission;
    private MissionRequest testRequest;

    @BeforeEach
    void setUp() {
        // Préparer les données de test
        testCompany = Company.builder()
                .id(1L)
                .name("Test Company")
                .email("test@company.com")
                .build();

        testMission = Mission.builder()
                .id(1L)
                .company(testCompany)
                .title("Java Developer")
                .description("Backend development")
                .durationWeeks(12)
                .dailyRate(new BigDecimal("500"))
                .requiredSkills("Java,Spring,MySQL")
                .status(Mission.MissionStatus.OPEN)
                .build();

        testRequest = new MissionRequest(
                1L,
                "Java Developer",
                "Backend development",
                12,
                new BigDecimal("500"),
                "Java,Spring,MySQL"
        );
    }

    @Test
    @DisplayName("Créer une mission - Succès")
    void testCreateMission_Success() {
        // Given
        when(companyRepository.findById(1L)).thenReturn(Optional.of(testCompany));
        when(missionRepository.save(any(Mission.class))).thenReturn(testMission);

        // When
        MissionResponse result = missionService.create(testRequest);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.title()).isEqualTo("Java Developer");
        assertThat(result.companyName()).isEqualTo("Test Company");
        assertThat(result.dailyRate()).isEqualTo(new BigDecimal("500"));

        verify(companyRepository, times(1)).findById(1L);
        verify(missionRepository, times(1)).save(any(Mission.class));
    }

    @Test
    @DisplayName("Créer une mission - Company non trouvée")
    void testCreateMission_CompanyNotFound() {
        // Given
        when(companyRepository.findById(anyLong())).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> missionService.create(testRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Company not found");

        verify(companyRepository, times(1)).findById(anyLong());
        verify(missionRepository, never()).save(any(Mission.class));
    }

    @Test
    @DisplayName("Lister toutes les missions")
    void testFindAll() {
        // Given
        Mission mission2 = Mission.builder()
                .id(2L)
                .company(testCompany)
                .title("React Developer")
                .description("Frontend development")
                .durationWeeks(8)
                .dailyRate(new BigDecimal("450"))
                .requiredSkills("React,TypeScript")
                .status(Mission.MissionStatus.OPEN)
                .build();

        when(missionRepository.findAllWithRelations()).thenReturn(Arrays.asList(testMission, mission2));

        // When
        List<MissionResponse> results = missionService.findAll();

        // Then
        assertThat(results).hasSize(2);
        assertThat(results.get(0).title()).isEqualTo("Java Developer");
        assertThat(results.get(1).title()).isEqualTo("React Developer");

        verify(missionRepository, times(1)).findAllWithRelations();
    }

    @Test
    @DisplayName("Trouver une mission par ID - Succès")
    void testFindById_Success() {
        // Given
        when(missionRepository.findByIdWithRelations(1L)).thenReturn(Optional.of(testMission));

        // When
        MissionResponse result = missionService.findById(1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(1L);
        assertThat(result.title()).isEqualTo("Java Developer");

        verify(missionRepository, times(1)).findByIdWithRelations(1L);
    }

    @Test
    @DisplayName("Trouver une mission par ID - Non trouvée")
    void testFindById_NotFound() {
        // Given
        when(missionRepository.findByIdWithRelations(anyLong())).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> missionService.findById(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Mission not found");

        verify(missionRepository, times(1)).findByIdWithRelations(999L);
    }

    @Test
    @DisplayName("Trouver les missions ouvertes")
    void testFindOpen() {
        // Given
        when(missionRepository.findByStatusWithRelations(Mission.MissionStatus.OPEN))
                .thenReturn(List.of(testMission));

        // When
        List<MissionResponse> results = missionService.findOpen();

        // Then
        assertThat(results).hasSize(1);
        assertThat(results.get(0).status()).isEqualTo("OPEN");

        verify(missionRepository, times(1)).findByStatusWithRelations(Mission.MissionStatus.OPEN);
    }

    @Test
    @DisplayName("Trouver les missions par entreprise")
    void testFindByCompany() {
        // Given
        when(missionRepository.findByCompanyIdWithRelations(1L)).thenReturn(List.of(testMission));

        // When
        List<MissionResponse> results = missionService.findByCompany(1L);

        // Then
        assertThat(results).hasSize(1);
        assertThat(results.get(0).companyId()).isEqualTo(1L);

        verify(missionRepository, times(1)).findByCompanyIdWithRelations(1L);
    }

    @Test
    @DisplayName("Mettre à jour une mission - Succès")
    void testUpdate_Success() {
        // Given
        MissionRequest updateRequest = new MissionRequest(
                1L,
                "Senior Java Developer",
                "Advanced backend development",
                16,
                new BigDecimal("600"),
                "Java,Spring,Microservices"
        );

        when(missionRepository.findById(1L)).thenReturn(Optional.of(testMission));
        when(missionRepository.save(any(Mission.class))).thenReturn(testMission);

        // When
        MissionResponse result = missionService.update(1L, updateRequest);

        // Then
        assertThat(result).isNotNull();
        verify(missionRepository, times(1)).findById(1L);
        verify(missionRepository, times(1)).save(any(Mission.class));
    }

    @Test
    @DisplayName("Supprimer une mission")
    void testDelete() {
        // Given
        doNothing().when(missionRepository).deleteById(1L);

        // When
        missionService.delete(1L);

        // Then
        verify(missionRepository, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("Changer le statut d'une mission")
    void testUpdateStatus() {
        // Given
        when(missionRepository.findById(1L)).thenReturn(Optional.of(testMission));
        when(missionRepository.save(any(Mission.class))).thenReturn(testMission);

        // When
        MissionResponse result = missionService.updateStatus(1L, "IN_PROGRESS");

        // Then
        assertThat(result).isNotNull();
        verify(missionRepository, times(1)).findById(1L);
        verify(missionRepository, times(1)).save(any(Mission.class));
    }
}
