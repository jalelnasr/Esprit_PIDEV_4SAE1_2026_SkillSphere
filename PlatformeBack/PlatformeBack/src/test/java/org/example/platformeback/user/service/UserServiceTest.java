package org.example.platformeback.user.service;

import org.example.platformeback.user.dto.*;
import org.example.platformeback.user.model.Role;
import org.example.platformeback.user.model.User;
import org.example.platformeback.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;

    @InjectMocks private UserServiceImpl userService;

    private User formateur;
    private User apprenant;

    @BeforeEach
    void setUp() {
        formateur = User.builder()
                .idUser(8L).nom("aziz").prenom("aziz")
                .email("aziz@gmail.com").passwordHash("$2a$encoded")
                .role(Role.FORMATEUR).isActive(true).build();

        apprenant = User.builder()
                .idUser(11L).nom("Ben Ali").prenom("Ahmed")
                .email("ahmed@gmail.com").passwordHash("$2a$encoded")
                .role(Role.APPRENANT).isActive(true).build();
    }

    // ===== GET ME =====

    @Test
    void getMe_shouldReturnCurrentUser() {
        when(userRepository.findByEmail("aziz@gmail.com")).thenReturn(Optional.of(formateur));

        UserResponse result = userService.getMe("aziz@gmail.com");

        assertNotNull(result);
        assertEquals(8L, result.idUser());
        assertEquals("aziz@gmail.com", result.email());
        assertEquals(Role.FORMATEUR, result.role());
    }

    @Test
    void getMe_shouldThrowWhenUserNotFound() {
        when(userRepository.findByEmail("unknown@gmail.com")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> userService.getMe("unknown@gmail.com"));
    }

    // ===== UPDATE ME =====

    @Test
    void updateMe_shouldUpdateOnlyProvidedFields() {
        UserUpdateRequest req = new UserUpdateRequest("NewNom", null, "0612345678", null);
        when(userRepository.findByEmail("aziz@gmail.com")).thenReturn(Optional.of(formateur));
        when(userRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        UserResponse result = userService.updateMe("aziz@gmail.com", req);

        assertEquals("NewNom", result.nom());
        assertEquals("aziz", result.prenom()); // inchangé
        assertEquals("0612345678", result.phone());
    }

    @Test
    void updateMe_shouldNotUpdateNullFields() {
        UserUpdateRequest req = new UserUpdateRequest(null, null, null, null);
        when(userRepository.findByEmail("aziz@gmail.com")).thenReturn(Optional.of(formateur));
        when(userRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        UserResponse result = userService.updateMe("aziz@gmail.com", req);

        assertEquals("aziz", result.nom()); // inchangé
        assertEquals("aziz", result.prenom()); // inchangé
    }

    // ===== CHANGE PASSWORD =====

    @Test
    void changeMyPassword_shouldSucceedWithCorrectOldPassword() {
        ChangePasswordRequest req = new ChangePasswordRequest("oldpass", "newpassword123");
        when(userRepository.findByEmail("aziz@gmail.com")).thenReturn(Optional.of(formateur));
        when(passwordEncoder.matches("oldpass", "$2a$encoded")).thenReturn(true);
        when(passwordEncoder.encode("newpassword123")).thenReturn("$2a$newencoded");

        assertDoesNotThrow(() -> userService.changeMyPassword("aziz@gmail.com", req));
        verify(userRepository).save(formateur);
    }

    @Test
    void changeMyPassword_shouldThrowWhenOldPasswordIncorrect() {
        ChangePasswordRequest req = new ChangePasswordRequest("wrongpass", "newpassword123");
        when(userRepository.findByEmail("aziz@gmail.com")).thenReturn(Optional.of(formateur));
        when(passwordEncoder.matches("wrongpass", "$2a$encoded")).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> userService.changeMyPassword("aziz@gmail.com", req));
        assertEquals("Old password incorrect", ex.getMessage());
    }

    @Test
    void changeMyPassword_shouldThrowWhenNewPasswordTooShort() {
        ChangePasswordRequest req = new ChangePasswordRequest("oldpass", "short");
        when(userRepository.findByEmail("aziz@gmail.com")).thenReturn(Optional.of(formateur));
        when(passwordEncoder.matches("oldpass", "$2a$encoded")).thenReturn(true);

        assertThrows(RuntimeException.class,
                () -> userService.changeMyPassword("aziz@gmail.com", req));
    }

    // ===== ADMIN CREATE USER =====

    @Test
    void adminCreateUser_shouldCreateUserWithSpecifiedRole() {
        AdminCreateUserRequest req = new AdminCreateUserRequest(
                "Sara", "Trabelsi", "sara@gmail.com", "password123",
                Role.FORMATEUR, null, null, true);

        when(userRepository.existsByEmail("sara@gmail.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded");
        when(userRepository.save(any())).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setIdUser(20L);
            return u;
        });

        UserResponse result = userService.adminCreateUser(req);

        assertNotNull(result);
        assertEquals(Role.FORMATEUR, result.role());
    }

    @Test
    void adminCreateUser_shouldDefaultToAPPRENANTWhenNoRole() {
        AdminCreateUserRequest req = new AdminCreateUserRequest(
                "Test", "User", "test@gmail.com", "password123",
                null, null, null, null);

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");
        when(userRepository.save(any())).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            assertEquals(Role.APPRENANT, u.getRole());
            u.setIdUser(21L);
            return u;
        });

        userService.adminCreateUser(req);
    }

    @Test
    void adminCreateUser_shouldThrowWhenEmailExists() {
        AdminCreateUserRequest req = new AdminCreateUserRequest(
                "aziz", "aziz", "aziz@gmail.com", "password123",
                null, null, null, null);
        when(userRepository.existsByEmail("aziz@gmail.com")).thenReturn(true);

        assertThrows(RuntimeException.class, () -> userService.adminCreateUser(req));
    }

    @Test
    void adminCreateUser_shouldThrowWhenPasswordTooShort() {
        AdminCreateUserRequest req = new AdminCreateUserRequest(
                "Test", "User", "test@gmail.com", "short",
                null, null, null, null);
        when(userRepository.existsByEmail(anyString())).thenReturn(false);

        assertThrows(RuntimeException.class, () -> userService.adminCreateUser(req));
    }

    // ===== ADMIN LIST USERS =====

    @Test
    void adminListUsers_shouldReturnAllUsers() {
        when(userRepository.findAll()).thenReturn(List.of(formateur, apprenant));

        List<UserResponse> result = userService.adminListUsers();

        assertEquals(2, result.size());
    }

    @Test
    void adminListUsers_shouldReturnEmptyListWhenNoUsers() {
        when(userRepository.findAll()).thenReturn(List.of());

        List<UserResponse> result = userService.adminListUsers();

        assertTrue(result.isEmpty());
    }

    // ===== ADMIN GET USER =====

    @Test
    void adminGetUser_shouldReturnUserById() {
        when(userRepository.findById(8L)).thenReturn(Optional.of(formateur));

        UserResponse result = userService.adminGetUser(8L);

        assertEquals(8L, result.idUser());
        assertEquals("aziz@gmail.com", result.email());
    }

    @Test
    void adminGetUser_shouldThrowWhenNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> userService.adminGetUser(99L));
    }

    // ===== ADMIN UPDATE USER =====

    @Test
    void adminUpdateUser_shouldUpdateFields() {
        AdminUpdateUserRequest req = new AdminUpdateUserRequest(
                "NewNom", "NewPrenom", null, null, null);
        when(userRepository.findById(8L)).thenReturn(Optional.of(formateur));
        when(userRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        UserResponse result = userService.adminUpdateUser(8L, req);

        assertEquals("NewNom", result.nom());
        assertEquals("NewPrenom", result.prenom());
    }

    @Test
    void adminUpdateUser_shouldThrowWhenEmailAlreadyTaken() {
        AdminUpdateUserRequest req = new AdminUpdateUserRequest(
                null, null, "ahmed@gmail.com", null, null);
        when(userRepository.findById(8L)).thenReturn(Optional.of(formateur));
        when(userRepository.existsByEmailAndIdUserNot("ahmed@gmail.com", 8L)).thenReturn(true);

        assertThrows(RuntimeException.class, () -> userService.adminUpdateUser(8L, req));
    }

    // ===== ADMIN UPDATE ROLE =====

    @Test
    void adminUpdateRole_shouldChangeUserRole() {
        when(userRepository.findById(11L)).thenReturn(Optional.of(apprenant));
        when(userRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        UserResponse result = userService.adminUpdateRole(11L, Role.FORMATEUR);

        assertEquals(Role.FORMATEUR, result.role());
    }

    // ===== ADMIN SET ACTIVE =====

    @Test
    void adminSetActive_shouldDeactivateUser() {
        when(userRepository.findById(11L)).thenReturn(Optional.of(apprenant));
        when(userRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        UserResponse result = userService.adminSetActive(11L, false);

        assertFalse(result.isActive());
    }

    @Test
    void adminSetActive_shouldActivateUser() {
        apprenant.setIsActive(false);
        when(userRepository.findById(11L)).thenReturn(Optional.of(apprenant));
        when(userRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        UserResponse result = userService.adminSetActive(11L, true);

        assertTrue(result.isActive());
    }

    // ===== ADMIN RESET PASSWORD =====

    @Test
    void adminResetPassword_shouldEncodeNewPassword() {
        AdminResetPasswordRequest req = new AdminResetPasswordRequest("newpassword123");
        when(userRepository.findById(11L)).thenReturn(Optional.of(apprenant));
        when(passwordEncoder.encode("newpassword123")).thenReturn("$2a$newencoded");

        assertDoesNotThrow(() -> userService.adminResetPassword(11L, req));
        verify(userRepository).save(apprenant);
        assertEquals("$2a$newencoded", apprenant.getPasswordHash());
    }

    @Test
    void adminResetPassword_shouldThrowWhenPasswordTooShort() {
        AdminResetPasswordRequest req = new AdminResetPasswordRequest("short");

        assertThrows(RuntimeException.class, () -> userService.adminResetPassword(11L, req));
    }

    @Test
    void adminResetPassword_shouldThrowWhenRequestNull() {
        assertThrows(RuntimeException.class, () -> userService.adminResetPassword(11L, null));
    }

    // ===== ADMIN DELETE USER =====

    @Test
    void adminDeleteUser_shouldDeleteExistingUser() {
        when(userRepository.existsById(11L)).thenReturn(true);

        assertDoesNotThrow(() -> userService.adminDeleteUser(11L));
        verify(userRepository).deleteById(11L);
    }

    @Test
    void adminDeleteUser_shouldThrowWhenUserNotFound() {
        when(userRepository.existsById(99L)).thenReturn(false);

        assertThrows(RuntimeException.class, () -> userService.adminDeleteUser(99L));
        verify(userRepository, never()).deleteById(any());
    }
}
