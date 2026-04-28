package org.example.b2bmodule.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.b2bmodule.dto.MissionRequest;
import org.example.b2bmodule.entity.Company;
import org.example.b2bmodule.entity.Mission;
import org.example.b2bmodule.repository.CompanyRepository;
import org.example.b2bmodule.repository.MissionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests d'intégration pour MissionController
 * 
 * Teste les endpoints REST avec Spring Security
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("test")
@DisplayName("MissionController - Tests d'Intégration")
class MissionControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private MissionRepository missionRepository;

    @Autowired
    private CompanyRepository companyRepository;

    private Company testCompany;
    private Long companyId;

    @BeforeEach
    void setUp() {
        // Nettoyer la base de données
        missionRepository.deleteAll();
        companyRepository.deleteAll();

        // Créer une entreprise de test
        testCompany = Company.builder()
                .name("Test Company")
                .email("test@company.com")
                .phone("123456789")
                .address("123 Test St")
                .build();
        testCompany = companyRepository.save(testCompany);
        companyId = testCompany.getId();
    }

    @Test
    @DisplayName("GET /missions - Sans authentification - Doit échouer (403)")
    void testGetMissions_Unauthorized() throws Exception {
        mockMvc.perform(get("/api/b2b/missions"))
                .andExpect(status().isForbidden()); // 403 car Spring Security bloque avant l'authentification
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /missions - Avec ADMIN - Succès")
    void testGetMissions_AsAdmin_Success() throws Exception {
        // Given
        createTestMission("Java Developer", new BigDecimal("500"));
        createTestMission("React Developer", new BigDecimal("450"));

        // When & Then
        mockMvc.perform(get("/api/b2b/missions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].title").exists())
                .andExpect(jsonPath("$[1].title").exists());
    }

    @Test
    @WithMockUser(roles = "APPRENANT")
    @DisplayName("GET /missions - Avec APPRENANT - Succès")
    void testGetMissions_AsApprenant_Success() throws Exception {
        // Given
        createTestMission("Java Developer", new BigDecimal("500"));

        // When & Then
        mockMvc.perform(get("/api/b2b/missions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("POST /missions - Créer une mission - Succès")
    void testCreateMission_AsAdmin_Success() throws Exception {
        // Given
        MissionRequest request = new MissionRequest(
                companyId,
                "Full Stack Developer",
                "Web application development",
                12,
                new BigDecimal("550"),
                "Java,React,MySQL"
        );

        // When & Then
        mockMvc.perform(post("/api/b2b/missions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.title").value("Full Stack Developer"))
                .andExpect(jsonPath("$.companyName").value("Test Company"))
                .andExpect(jsonPath("$.dailyRate").value(550))
                .andExpect(jsonPath("$.status").value("OPEN"));
    }

    @Test
    @WithMockUser(roles = "RH_ENTREPRISE")
    @DisplayName("POST /missions - Créer une mission - RH - Succès")
    void testCreateMission_AsRH_Success() throws Exception {
        // Given
        MissionRequest request = new MissionRequest(
                companyId,
                "DevOps Engineer",
                "Infrastructure management",
                8,
                new BigDecimal("600"),
                "Docker,Kubernetes,AWS"
        );

        // When & Then
        mockMvc.perform(post("/api/b2b/missions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("DevOps Engineer"));
    }

    @Test
    @WithMockUser(roles = "APPRENANT")
    @DisplayName("POST /missions - Créer une mission - APPRENANT - Doit échouer (500 AccessDenied)")
    void testCreateMission_AsApprenant_Forbidden() throws Exception {
        // Given - Créer une company valide d'abord
        Company company = createTestCompany();
        
        MissionRequest request = new MissionRequest(
                company.getId(),
                "Test Mission",
                "Test",
                4,
                new BigDecimal("400"),
                "Test"
        );

        // When & Then - GlobalExceptionHandler transforme AccessDeniedException en 500
        mockMvc.perform(post("/api/b2b/missions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /missions/{id} - Trouver par ID - Succès")
    void testGetMissionById_Success() throws Exception {
        // Given
        Mission mission = createTestMission("Backend Developer", new BigDecimal("500"));

        // When & Then
        mockMvc.perform(get("/api/b2b/missions/" + mission.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(mission.getId()))
                .andExpect(jsonPath("$.title").value("Backend Developer"))
                .andExpect(jsonPath("$.dailyRate").value(500));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /missions/{id} - ID inexistant - 500")
    void testGetMissionById_NotFound() throws Exception {
        mockMvc.perform(get("/api/b2b/missions/99999"))
                .andExpect(status().is5xxServerError());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("PUT /missions/{id} - Modifier une mission - Succès")
    void testUpdateMission_Success() throws Exception {
        // Given
        Mission mission = createTestMission("Original Title", new BigDecimal("400"));
        
        MissionRequest updateRequest = new MissionRequest(
                companyId,
                "Updated Title",
                "Updated description",
                16,
                new BigDecimal("600"),
                "Updated,Skills"
        );

        // When & Then
        mockMvc.perform(put("/api/b2b/missions/" + mission.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(mission.getId()));
    }

    @Test
    @WithMockUser(roles = "APPRENANT")
    @DisplayName("PUT /missions/{id} - Modifier - APPRENANT - Doit échouer (500 AccessDenied)")
    void testUpdateMission_AsApprenant_Forbidden() throws Exception {
        // Given
        Mission mission = createTestMission("Test Mission", new BigDecimal("400"));
        Company company = mission.getCompany();
        
        MissionRequest updateRequest = new MissionRequest(
                company.getId(),
                "Hacked Title",
                "Hacked",
                1,
                new BigDecimal("1"),
                "Hack"
        );

        // When & Then - GlobalExceptionHandler transforme AccessDeniedException en 500
        mockMvc.perform(put("/api/b2b/missions/" + mission.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("DELETE /missions/{id} - Supprimer - ADMIN - Succès")
    void testDeleteMission_AsAdmin_Success() throws Exception {
        // Given
        Mission mission = createTestMission("To Delete", new BigDecimal("400"));

        // When & Then
        mockMvc.perform(delete("/api/b2b/missions/" + mission.getId()))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(roles = "RH_ENTREPRISE")
    @DisplayName("DELETE /missions/{id} - Supprimer - RH - Doit échouer (500 AccessDenied)")
    void testDeleteMission_AsRH_Forbidden() throws Exception {
        // Given
        Mission mission = createTestMission("To Delete", new BigDecimal("400"));

        // When & Then - GlobalExceptionHandler transforme AccessDeniedException en 500
        mockMvc.perform(delete("/api/b2b/missions/" + mission.getId()))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /missions/open - Missions ouvertes - Succès")
    void testGetOpenMissions_Success() throws Exception {
        // Given
        createTestMission("Open Mission 1", new BigDecimal("500"));
        createTestMission("Open Mission 2", new BigDecimal("600"));

        // When & Then
        mockMvc.perform(get("/api/b2b/missions/open"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[*].status", everyItem(is("OPEN"))));
    }

    // Helper method
    private Mission createTestMission(String title, BigDecimal dailyRate) {
        Mission mission = Mission.builder()
                .company(testCompany)
                .title(title)
                .description("Test description")
                .durationWeeks(12)
                .dailyRate(dailyRate)
                .requiredSkills("Java,Spring")
                .status(Mission.MissionStatus.OPEN)
                .build();
        return missionRepository.save(mission);
    }
    
    private Company createTestCompany() {
        Company company = Company.builder()
                .name("Test Company " + System.currentTimeMillis())
                .email("test" + System.currentTimeMillis() + "@company.com")
                .phone("123456789")
                .address("Test Address")
                .build();
        return companyRepository.save(company);
    }
}
