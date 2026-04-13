package org.example.platformeback.user.controller;

import lombok.RequiredArgsConstructor;
import org.example.platformeback.user.dto.*;
import org.example.platformeback.user.model.Role;
import org.example.platformeback.user.service.UserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class UserController {

    private final UserService userService;

    // ======================
    //  Everyone (connected)
    // ======================

    @GetMapping("/me")
    public UserResponse me(Authentication auth) {
        return userService.getMe(auth.getName());
    }

    @PutMapping("/me")
    public UserResponse updateMe(Authentication auth, @RequestBody UserUpdateRequest req) {
        return userService.updateMe(auth.getName(), req);
    }

    @PutMapping("/me/password")
    public void changePassword(Authentication auth, @RequestBody ChangePasswordRequest req) {
        userService.changeMyPassword(auth.getName(), req);
    }

    // ======================
    //  Admin only (CRUD)
    // ======================

    @PreAuthorize("hasAnyRole('ADMIN', 'RH_ENTREPRISE')")
    @PostMapping("/admin")
    public UserResponse adminCreate(@RequestBody AdminCreateUserRequest req) {
        return userService.adminCreateUser(req);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin")
    public List<UserResponse> adminList() {
        return userService.adminListUsers();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'RH_ENTREPRISE')")
    @GetMapping("/admin/{id}")
    public UserResponse adminGet(@PathVariable Long id) {
        return userService.adminGetUser(id);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'RH_ENTREPRISE')")
    @PutMapping("/admin/{id}")
    public UserResponse adminUpdate(@PathVariable Long id, @RequestBody AdminUpdateUserRequest req) {
        return userService.adminUpdateUser(id, req);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/{id}/role")
    public UserResponse adminRole(@PathVariable Long id,
                                  @RequestParam Role role,
                                  @RequestParam(required = false) Long companyId) {
        return userService.adminUpdateRole(id, role, companyId);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'RH_ENTREPRISE')")
    @PutMapping("/admin/{id}/active")
    public UserResponse adminActive(@PathVariable Long id, @RequestParam Boolean active) {
        return userService.adminSetActive(id, active);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'RH_ENTREPRISE')")
    @PutMapping("/admin/{id}/password")
    public void adminResetPassword(@PathVariable Long id, @RequestBody AdminResetPasswordRequest req) {
        userService.adminResetPassword(id, req);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'RH_ENTREPRISE')")
    @DeleteMapping("/admin/{id}")
    public void adminDelete(@PathVariable Long id) {
        userService.adminDeleteUser(id);
    }

    // ======================
    //  B2B: Par entreprise
    // ======================

    @PreAuthorize("hasAnyRole('ADMIN', 'RH_ENTREPRISE', 'MANAGER')")
    @GetMapping("/company/{companyId}")
    public List<UserResponse> getUsersByCompany(@PathVariable Long companyId) {
        return userService.getUsersByCompany(companyId);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'RH_ENTREPRISE', 'MANAGER')")
    @GetMapping("/company/{companyId}/role/{role}")
    public List<UserResponse> getUsersByCompanyAndRole(@PathVariable Long companyId, @PathVariable Role role) {
        return userService.getUsersByCompanyAndRole(companyId, role);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'RH_ENTREPRISE', 'MANAGER')")
    @GetMapping("/company/{companyId}/managers")
    public List<UserResponse> getManagersByCompany(@PathVariable Long companyId) {
        return userService.getManagersByCompany(companyId);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'RH_ENTREPRISE', 'MANAGER')")
    @GetMapping("/company/{companyId}/rh")
    public List<UserResponse> getRHByCompany(@PathVariable Long companyId) {
        return userService.getRHByCompany(companyId);
    }

    // ======================
    //  Microservices: Endpoints internes
    // ======================

    /**
     * Endpoint dédié aux appels inter-microservices
     * Accessible avec n'importe quel token JWT valide
     */
    @GetMapping("/internal/company/{companyId}/rh")
    public List<UserResponse> getRHByCompanyInternal(@PathVariable Long companyId) {
        return userService.getRHByCompany(companyId);
    }
}
