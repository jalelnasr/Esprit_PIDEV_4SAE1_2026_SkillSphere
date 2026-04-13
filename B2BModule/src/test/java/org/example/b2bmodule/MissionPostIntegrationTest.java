package org.example.b2bmodule;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.b2bmodule.dto.MissionRequest;
import org.example.b2bmodule.entity.Company;
import org.example.b2bmodule.repository.CompanyRepository;
import org.example.b2bmodule.repository.MissionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test d'intégration pour POST /api/b2b/missions
 *
 * Vérifie que :
 * - 201 Created + mission créée
 * - 400 Bad Request pour payload invalide
 * - 404 Not Found pour companyId inexistant
 * - Support des alias : dailyRate/budget/amount, duration/durationWeeks
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("test")
public class MissionPostIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private MissionRepository missionRepository;

    @Autowired
    private CompanyRepository companyRepository;

    private Long companyId;

    @BeforeEach
    public void setup() {
        // Créer une entreprise de test
        Company company = new Company();
        company.setName("Test Company");
        company.setEmail("test@company.com");
        company.setPhone("123456789");
        company.setAddress("123 Test St");
        Company saved = companyRepository.save(company);
        companyId = saved.getId();
    }

    @Test
    public void testCreateMissionWithMinimalPayload() throws Exception {
        // Payload minimal valide
        String payload = """
            {
                "companyId": %d,
                "title": "Mission Java",
                "description": "Développement API",
                "dailyRate": 500,
                "requiredSkills": "java,spring"
            }
            """.formatted(companyId);

        mockMvc.perform(post("/api/b2b/missions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.title").value("Mission Java"))
                .andExpect(jsonPath("$.description").value("Développement API"))
                .andExpect(jsonPath("$.budget").value(500))
                .andExpect(jsonPath("$.requiredSkills").value("java,spring"))
                .andExpect(jsonPath("$.status").value("OPEN"));

        // Vérifier que la mission est en DB
        assertThat(missionRepository.findAll()).hasSize(1);
    }

    @Test
    public void testCreateMissionWithBudgetAlias() throws Exception {
        // Utiliser 'budget' au lieu de 'dailyRate'
        String payload = """
            {
                "companyId": %d,
                "title": "React Developer",
                "description": "Frontend development",
                "budget": 750,
                "requiredSkills": "react,typescript"
            }
            """.formatted(companyId);

        mockMvc.perform(post("/api/b2b/missions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("React Developer"))
                .andExpect(jsonPath("$.budget").value(750));

        assertThat(missionRepository.findAll()).hasSize(1);
    }

    @Test
    public void testCreateMissionWithDurationWeeksAlias() throws Exception {
        // Utiliser 'durationWeeks' au lieu de 'duration'
        String payload = """
            {
                "companyId": %d,
                "title": "Backend API",
                "description": "Build REST API",
                "durationWeeks": 12,
                "dailyRate": 600,
                "requiredSkills": "java,spring,mysql"
            }
            """.formatted(companyId);

        mockMvc.perform(post("/api/b2b/missions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Backend API"));
        // duration sera "12 weeks"
    }

    @Test
    public void testCreateMissionWithDurationString() throws Exception {
        // Utiliser duration comme string
        String payload = """
            {
                "companyId": %d,
                "title": "DevOps Engineer",
                "description": "Infrastructure setup",
                "duration": "8 weeks",
                "budget": 800,
                "requiredSkills": "docker,kubernetes"
            }
            """.formatted(companyId);

        mockMvc.perform(post("/api/b2b/missions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("DevOps Engineer"));
    }

    @Test
    public void testCreateMissionWithAmountAlias() throws Exception {
        // Utiliser 'amount' au lieu de 'dailyRate'
        String payload = """
            {
                "companyId": %d,
                "title": "Data Scientist",
                "description": "ML Model Development",
                "amount": 1000,
                "duration": "6 weeks",
                "requiredSkills": "python,pytorch,sql"
            }
            """.formatted(companyId);

        mockMvc.perform(post("/api/b2b/missions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.budget").value(1000));
    }

    @Test
    public void testCreateMissionWithSkillsArray() throws Exception {
        // Utiliser requiredSkills comme array
        String payload = """
            {
                "companyId": %d,
                "title": "Full Stack Developer",
                "description": "Web application development",
                "dailyRate": 650,
                "requiredSkills": ["javascript", "react", "nodejs", "mongodb"]
            }
            """.formatted(companyId);

        mockMvc.perform(post("/api/b2b/missions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Full Stack Developer"))
                .andExpect(jsonPath("$.requiredSkills").value(containsString("javascript")))
                .andExpect(jsonPath("$.requiredSkills").value(containsString("react")));
    }

    @Test
    public void testCreateMissionMissingCompanyId() throws Exception {
        String payload = """
            {
                "title": "Mission Java",
                "description": "Développement API",
                "dailyRate": 500,
                "requiredSkills": "java"
            }
            """;

        mockMvc.perform(post("/api/b2b/missions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("Company ID")));
    }

    @Test
    public void testCreateMissionInvalidCompanyId() throws Exception {
        // Company ID qui n'existe pas
        String payload = """
            {
                "companyId": 99999,
                "title": "Mission Java",
                "description": "Développement API",
                "dailyRate": 500,
                "requiredSkills": "java"
            }
            """;

        mockMvc.perform(post("/api/b2b/missions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value(containsString("Company")));
    }

    @Test
    public void testCreateMissionMissingTitle() throws Exception {
        String payload = """
            {
                "companyId": %d,
                "description": "Développement API",
                "dailyRate": 500,
                "requiredSkills": "java"
            }
            """.formatted(companyId);

        mockMvc.perform(post("/api/b2b/missions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("title")));
    }

    @Test
    public void testCreateMissionZeroBudget() throws Exception {
        String payload = """
            {
                "companyId": %d,
                "title": "Mission Java",
                "description": "Développement API",
                "dailyRate": 0,
                "requiredSkills": "java"
            }
            """.formatted(companyId);

        mockMvc.perform(post("/api/b2b/missions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("Budget/Daily rate")));
    }

    @Test
    public void testCreateMissionNegativeBudget() throws Exception {
        String payload = """
            {
                "companyId": %d,
                "title": "Mission Java",
                "description": "Développement API",
                "dailyRate": -500,
                "requiredSkills": "java"
            }
            """.formatted(companyId);

        mockMvc.perform(post("/api/b2b/missions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("Budget/Daily rate")));
    }

    @Test
    public void testCreateMissionDefaultStatus() throws Exception {
        // Vérifier que le statut par défaut est OPEN
        String payload = """
            {
                "companyId": %d,
                "title": "Mission Java",
                "description": "Développement API",
                "dailyRate": 500,
                "requiredSkills": "java"
            }
            """.formatted(companyId);

        mockMvc.perform(post("/api/b2b/missions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("OPEN"));
    }
}






