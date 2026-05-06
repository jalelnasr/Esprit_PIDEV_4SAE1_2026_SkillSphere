package org.example.platformeback.integration;

import org.example.platformeback.auth.dto.AuthResponse;
import org.example.platformeback.auth.reset.PasswordResetService;
import org.example.platformeback.auth.service.AuthService;
import org.example.platformeback.security.JwtService;
import org.example.platformeback.security.UserDetailsServiceImpl;
import org.example.platformeback.user.dto.UserResponse;
import org.example.platformeback.user.model.Role;
import org.example.platformeback.user.model.User;
import org.example.platformeback.user.repository.UserRepository;
import org.example.platformeback.user.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "app.jwt.secret=THIS_IS_A_VERY_LONG_SECRET_KEY_CHANGE_ME_1234567890_ABCDEFG",
        "app.jwt.expiration-ms=86400000",
        "service.api.key=formation-to-user-secret",
        "eureka.client.enabled=false",
        "spring.cloud.discovery.enabled=false"
})
@EnableAutoConfiguration(exclude = {
        DataSourceAutoConfiguration.class,
        HibernateJpaAutoConfiguration.class
})
@AutoConfigureMockMvc
class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @MockBean
    private AuthService authService;

    @MockBean
    private PasswordResetService passwordResetService;

    @MockBean
    private UserService userService;

        @MockBean
        private UserRepository userRepository;

    @MockBean
    private UserDetailsServiceImpl userDetailsService;

    @Test
    void authLoginEndpointShouldBePublic() throws Exception {
        when(authService.login(any())).thenReturn(new AuthResponse(
                "jwt-public",
                7L,
                "Ben",
                "Zo",
                "benzo@gmail.com",
                Role.APPRENANT
        ));

        mockMvc.perform(post("/api/auth/login")
                        .contentType("application/json")
                        .content("{\"email\":\"benzo@gmail.com\",\"password\":\"secret\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-public"))
                .andExpect(jsonPath("$.email").value("benzo@gmail.com"));
    }

    @Test
    void usersMeShouldReturnUnauthorizedWithoutJwt() throws Exception {
        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void usersMeShouldReturnUserForValidJwt() throws Exception {
        User tokenUser = User.builder()
                .idUser(7L)
                .nom("Ben")
                .prenom("Zo")
                .email("benzo@gmail.com")
                .role(Role.APPRENANT)
                .build();

        String token = jwtService.generateToken(tokenUser);

        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                "benzo@gmail.com",
                "ignored",
                List.of(new SimpleGrantedAuthority("ROLE_APPRENANT"))
        );

        when(userDetailsService.loadUserByUsername("benzo@gmail.com")).thenReturn(userDetails);
        when(userService.getMe("benzo@gmail.com")).thenReturn(new UserResponse(
                7L,
                "Ben",
                "Zo",
                "benzo@gmail.com",
                Role.APPRENANT,
                null,
                null,
                true,
                Instant.now()
        ));

        mockMvc.perform(get("/api/users/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("benzo@gmail.com"))
                .andExpect(jsonPath("$.role").value("APPRENANT"));
    }

    @Test
    void adminEndpointShouldBeForbiddenForNonAdminRole() throws Exception {
        User tokenUser = User.builder()
                .idUser(8L)
                .email("apprenant@example.com")
                .role(Role.APPRENANT)
                .build();

        String token = jwtService.generateToken(tokenUser);
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                "apprenant@example.com",
                "ignored",
                List.of(new SimpleGrantedAuthority("ROLE_APPRENANT"))
        );

        when(userDetailsService.loadUserByUsername("apprenant@example.com")).thenReturn(userDetails);

        mockMvc.perform(get("/api/users/admin")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminEndpointShouldBeAllowedForAdminRole() throws Exception {
        User tokenUser = User.builder()
                .idUser(1L)
                .email("admin@example.com")
                .role(Role.ADMIN)
                .build();

        String token = jwtService.generateToken(tokenUser);
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                "admin@example.com",
                "ignored",
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
        );

        when(userDetailsService.loadUserByUsername("admin@example.com")).thenReturn(userDetails);
        when(userService.adminListUsers()).thenReturn(List.of(new UserResponse(
                1L,
                "Admin",
                "Root",
                "admin@example.com",
                Role.ADMIN,
                null,
                null,
                true,
                Instant.now()
        )));

        mockMvc.perform(get("/api/users/admin")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].email").value("admin@example.com"));
    }
}
