package org.example.platformeback.user.service;

import org.example.platformeback.user.dto.*;
import org.example.platformeback.user.model.Role;

import java.util.List;

public interface UserService {

    // Everyone (connected)
    UserResponse getMe(String email);
    UserResponse getUserById(Long id);
    UserResponse updateMe(String email, UserUpdateRequest req);
    void changeMyPassword(String email, ChangePasswordRequest req);

    // Admin only (CRUD)
    UserResponse adminCreateUser(AdminCreateUserRequest req);
    List<UserResponse> adminListUsers();
    UserResponse adminGetUser(Long id);

    // Update parts
    UserResponse adminUpdateRole(Long id, Role role);
    UserResponse adminSetActive(Long id, Boolean active);
}
