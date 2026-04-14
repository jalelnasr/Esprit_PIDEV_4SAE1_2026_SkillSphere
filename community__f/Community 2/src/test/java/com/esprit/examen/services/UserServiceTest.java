package com.esprit.examen.services;

import com.esprit.examen.feign.UserFeignClient;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserFeignClient userFeignClient;

    @InjectMocks
    private UserService userService;

    @Test
    void getCurrentUserIdFromToken_resolvesAuthenticatedUserViaFeign() {
        UserFeignClient.UserResponse me = new UserFeignClient.UserResponse();
        me.setIdUser(7L);

        when(userFeignClient.getMe("Bearer token-123")).thenReturn(me);

        Long resolvedUserId = userService.getCurrentUserIdFromToken("token-123");

        assertEquals(7L, resolvedUserId);
        verify(userFeignClient).getMe("Bearer token-123");
    }

    @Test
    void getUserById_fallsBackToAdminLookupWhenTokenScopedLookupFails() {
        when(userFeignClient.getUserById("Bearer token-abc", 11L)).thenThrow(new RuntimeException("Forbidden"));
        when(userFeignClient.getMe("Bearer token-abc")).thenThrow(new RuntimeException("Forbidden"));

        UserFeignClient.UserResponse adminUser = new UserFeignClient.UserResponse();
        adminUser.setIdUser(11L);
        adminUser.setEmail("user11@example.com");
        when(userFeignClient.getUserByIdAdmin(11L)).thenReturn(adminUser);

        UserFeignClient.UserResponse resolved = userService.getUserById(11L, "token-abc");

        assertEquals(11L, resolved.getIdUser());
        verify(userFeignClient).getUserByIdAdmin(11L);
    }

    @Test
    void getCurrentUserId_readsAuthorizationHeaderFromRequestContext() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer xyz");
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));

        UserFeignClient.UserResponse me = new UserFeignClient.UserResponse();
        me.setIdUser(21L);
        when(userFeignClient.getMe("Bearer xyz")).thenReturn(me);

        Long currentUserId = userService.getCurrentUserId();

        assertEquals(21L, currentUserId);
        RequestContextHolder.resetRequestAttributes();
    }

    @Test
    void getCurrentUserIdFromToken_throwsWhenCannotResolveUser() {
        when(userFeignClient.getMe("Bearer bad-token")).thenThrow(new RuntimeException("Unauthorized"));

        assertThrows(RuntimeException.class, () -> userService.getCurrentUserIdFromToken("bad-token"));
    }

    @Test
    void getUserById_prefersTokenScopedLookupWhenAvailable() {
        UserFeignClient.UserResponse scoped = new UserFeignClient.UserResponse();
        scoped.setIdUser(33L);

        when(userFeignClient.getUserById("Bearer token", 33L)).thenReturn(scoped);

        UserFeignClient.UserResponse result = userService.getUserById(33L, "token");

        assertEquals(33L, result.getIdUser());
    }

    @Test
    void userExists_returnsTrueForPositiveIdsOnly() {
        assertTrue(userService.userExists(1L));
        assertFalse(userService.userExists(0L));
        assertFalse(userService.userExists(-5L));
        assertFalse(userService.userExists(null));
    }

    @Test
    void getDisplayName_prefersFullNameThenEmailThenFallback() {
        UserFeignClient.UserResponse complete = new UserFeignClient.UserResponse();
        complete.setIdUser(2L);
        complete.setPrenom("John");
        complete.setNom("Doe");
        complete.setEmail("john@example.com");

        UserFeignClient.UserResponse emailOnly = new UserFeignClient.UserResponse();
        emailOnly.setIdUser(3L);
        emailOnly.setEmail("mail-only@example.com");

        UserFeignClient.UserResponse empty = new UserFeignClient.UserResponse();
        empty.setIdUser(4L);

        when(userFeignClient.getUserById("Bearer tok", 2L)).thenReturn(complete);
        when(userFeignClient.getUserById("Bearer tok", 3L)).thenReturn(emailOnly);
        when(userFeignClient.getUserById("Bearer tok", 4L)).thenReturn(empty);

        assertEquals("John Doe", userService.getDisplayName(2L, "tok"));
        assertEquals("mail-only@example.com", userService.getDisplayName(3L, "tok"));
        assertEquals("User #4", userService.getDisplayName(4L, "tok"));
    }
}
