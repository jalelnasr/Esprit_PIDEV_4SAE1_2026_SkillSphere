package com.esprit.examen.config;

import com.esprit.examen.feign.UserFeignClient;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.concurrent.atomic.AtomicBoolean;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JwtProxyAuthenticationFilterTest {

    @Mock
    private UserFeignClient userFeignClient;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void doFilter_allowsPublicPathWithoutAuthorizationHeader() throws Exception {
        JwtProxyAuthenticationFilter filter = new JwtProxyAuthenticationFilter(userFeignClient);

        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api-docs/index.html");
        request.setServletPath("/api-docs/index.html");
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicBoolean chainCalled = new AtomicBoolean(false);

        FilterChain chain = (req, res) -> chainCalled.set(true);
        filter.doFilter(request, response, chain);

        assertTrue(chainCalled.get());
    }

    @Test
    void doFilter_rejectsMissingAuthorizationOnProtectedPath() throws Exception {
        JwtProxyAuthenticationFilter filter = new JwtProxyAuthenticationFilter(userFeignClient);

        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/posts");
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicBoolean chainCalled = new AtomicBoolean(false);

        FilterChain chain = (req, res) -> chainCalled.set(true);
        filter.doFilter(request, response, chain);

        assertEquals(401, response.getStatus());
        assertEquals(false, chainCalled.get());
    }

    @Test
    void doFilter_rejectsInvalidToken() throws Exception {
        JwtProxyAuthenticationFilter filter = new JwtProxyAuthenticationFilter(userFeignClient);

        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/posts");
        request.addHeader("Authorization", "Bearer bad-token");
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicBoolean chainCalled = new AtomicBoolean(false);

        when(userFeignClient.getMe("Bearer bad-token")).thenThrow(new RuntimeException("Unauthorized"));

        FilterChain chain = (req, res) -> chainCalled.set(true);
        filter.doFilter(request, response, chain);

        assertEquals(401, response.getStatus());
        assertEquals(false, chainCalled.get());
    }

    @Test
    void doFilter_setsAuthenticationAndContinuesWhenTokenIsValid() throws Exception {
        JwtProxyAuthenticationFilter filter = new JwtProxyAuthenticationFilter(userFeignClient);

        UserFeignClient.UserResponse me = new UserFeignClient.UserResponse();
        me.setIdUser(42L);
        me.setEmail("admin@example.com");
        me.setRole("ADMIN");

        when(userFeignClient.getMe("Bearer good-token")).thenReturn(me);

        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/posts");
        request.addHeader("Authorization", "Bearer good-token");
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicBoolean chainCalled = new AtomicBoolean(false);

        FilterChain chain = (req, res) -> chainCalled.set(true);
        filter.doFilter(request, response, chain);

        assertTrue(chainCalled.get());

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(authentication);
        assertTrue(authentication.getAuthorities().stream().anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority())));
    }
}
