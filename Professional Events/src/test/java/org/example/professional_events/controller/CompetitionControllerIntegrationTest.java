package org.example.professional_events.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.example.professional_events.entity.Competition;
import org.example.professional_events.repository.CompetitionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.security.Key;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CompetitionControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CompetitionRepository competitionRepository;

    private static final String SECRET = "THIS_IS_A_VERY_LONG_SECRET_KEY_CHANGE_ME_1234567890_ABCDEFG";

    private String generateToken(String email, String role, Long userId) {
        byte[] keyBytes = Base64.getEncoder().encode(SECRET.getBytes());
        Key key = Keys.hmacShaKeyFor(keyBytes);

        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);
        claims.put("userId", userId);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 86400000))
                .signWith(key)
                .compact();
    }

    @BeforeEach
    void setUp() {
        competitionRepository.deleteAll();
    }

    @Test
    void createCompetition_asFormateur_shouldReturn201() throws Exception {
        String token = generateToken("aziz@gmail.com", "FORMATEUR", 8L);

        Competition competition = new Competition();
        competition.setTitle("Test Competition");
        competition.setType(Competition.CompetitionType.PHYSICAL);
        competition.setParticipationType(Competition.ParticipationType.INDIVIDUAL);
        competition.setStatus(Competition.CompetitionStatus.OPEN);

        mockMvc.perform(post("/api/competitions")
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer " + token)
                .content(objectMapper.writeValueAsString(competition)))
                .andExpect(status().isCreated());
    }

    @Test
    void createCompetition_withoutToken_shouldReturn401() throws Exception {
        Competition competition = new Competition();
        competition.setTitle("Test Competition");

        mockMvc.perform(post("/api/competitions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(competition)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getAllCompetitions_withoutAuth_shouldReturn200() throws Exception {
        mockMvc.perform(get("/api/competitions"))
                .andExpect(status().isOk());
    }
}
