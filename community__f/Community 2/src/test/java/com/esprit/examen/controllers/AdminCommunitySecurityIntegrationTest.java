package com.esprit.examen.controllers;

import com.esprit.examen.config.JwtProxyAuthenticationFilter;
import com.esprit.examen.config.SecurityConfig;
import com.esprit.examen.dto.AdminCommunityStatsDTO;
import com.esprit.examen.services.AdminCommunityService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AdminCommunityController.class, properties = "community.admin.enabled=true")
@Import(SecurityConfig.class)
class AdminCommunitySecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AdminCommunityService adminCommunityService;

    @MockBean
    private JwtProxyAuthenticationFilter jwtProxyAuthenticationFilter;

    @BeforeEach
    void allowFilterChainExecution() throws Exception {
        doAnswer(invocation -> {
            ServletRequest request = invocation.getArgument(0);
            ServletResponse response = invocation.getArgument(1);
            FilterChain chain = invocation.getArgument(2);
            chain.doFilter(request, response);
            return null;
        }).when(jwtProxyAuthenticationFilter).doFilter(any(ServletRequest.class), any(ServletResponse.class), any(FilterChain.class));

        when(adminCommunityService.getStats()).thenReturn(new AdminCommunityStatsDTO());
    }

    @Test
    void adminStats_requiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/admin/community/stats"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "APPRENANT")
    void adminStats_forbiddenForNonAdminRole() throws Exception {
        mockMvc.perform(get("/api/admin/community/stats"))
            .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminStats_allowsAdminRole() throws Exception {
        mockMvc.perform(get("/api/admin/community/stats"))
            .andExpect(status().isOk());
    }
}
