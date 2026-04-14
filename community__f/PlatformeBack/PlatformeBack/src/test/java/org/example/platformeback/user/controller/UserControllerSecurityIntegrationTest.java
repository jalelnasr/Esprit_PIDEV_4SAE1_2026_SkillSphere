package org.example.platformeback.user.controller;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import org.example.platformeback.security.JwtAuthFilter;
import org.example.platformeback.security.SecurityConfig;
import org.example.platformeback.user.dto.UserResponse;
import org.example.platformeback.user.model.Role;
import org.example.platformeback.user.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = UserController.class)
@Import(SecurityConfig.class)
class UserControllerSecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @MockBean
    private JwtAuthFilter jwtAuthFilter;

    @BeforeEach
    void allowFilterChainExecution() throws Exception {
        doAnswer(invocation -> {
            ServletRequest request = invocation.getArgument(0);
            ServletResponse response = invocation.getArgument(1);
            FilterChain chain = invocation.getArgument(2);
            chain.doFilter(request, response);
            return null;
        }).when(jwtAuthFilter).doFilter(any(ServletRequest.class), any(ServletResponse.class), any(FilterChain.class));

        when(userService.adminListUsers()).thenReturn(List.of(
            new UserResponse(1L, "Doe", "Admin", "admin@example.com", Role.ADMIN, null, null, true, Instant.now())
        ));
    }

    @Test
    void adminList_requiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/users/admin"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "USER")
    void adminList_forbiddenForNonAdminRole() throws Exception {
        mockMvc.perform(get("/api/users/admin"))
            .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminList_allowsAdminRole() throws Exception {
        mockMvc.perform(get("/api/users/admin"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].email").value("admin@example.com"));
    }
}
