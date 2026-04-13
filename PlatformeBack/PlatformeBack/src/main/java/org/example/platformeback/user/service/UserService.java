package org.example.platformeback.user.service;

import org.example.platformeback.user.dto.*;
import org.example.platformeback.user.model.Role;

import java.util.List;

public interface UserService {

    // Everyone (connected)
    UserResponse getMe(String email);
    UserResponse updateMe(String email, UserUpdateRequest req);
    void changeMyPassword(String email, ChangePasswordRequest req);

    // Admin only (CRUD)
    UserResponse adminCreateUser(AdminCreateUserRequest req);
    List<UserResponse> adminListUsers();
    UserResponse adminGetUser(Long id);

    // Update parts
    UserResponse adminUpdateUser(Long id, AdminUpdateUserRequest req);          // ✅ NEW
    UserResponse adminUpdateRole(Long id, Role role, Long companyId);
    UserResponse adminSetActive(Long id, Boolean active);

    // Extra admin actions
    void adminResetPassword(Long id, AdminResetPasswordRequest req);            // ✅ NEW
    void adminDeleteUser(Long id);                                              // ✅ NEW

    // ✅ B2B: Filtrage par entreprise
    List<UserResponse> getUsersByCompany(Long companyId);
    List<UserResponse> getUsersByCompanyAndRole(Long companyId, Role role);
    List<UserResponse> getManagersByCompany(Long companyId);
    List<UserResponse> getRHByCompany(Long companyId);
}