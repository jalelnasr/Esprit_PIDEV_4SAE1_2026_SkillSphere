package com.esprit.examen.services;

import com.esprit.examen.feign.UserFeignClient;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;

@Service
public class UserService {

    @Resource
    private UserFeignClient userFeignClient;

    public Long getCurrentUserId() {
        String authorizationHeader = extractAuthorizationHeader();
        if (authorizationHeader != null && !authorizationHeader.isBlank()) {
            try {
                UserFeignClient.UserResponse me = userFeignClient.getMe(authorizationHeader);
                if (me != null && me.getIdUser() != null) {
                    return me.getIdUser();
                }
            } catch (Exception ignored) {
                // fallback below
            }
        }

        throw new RuntimeException("Unable to resolve authenticated user from Authorization header");
    }

    /**
     * Get user details by ID
     * @param userId User ID
     * @return User details
     * @throws RuntimeException if user not found
     */
    public UserFeignClient.UserResponse getUserById(Long userId) {
        try {
            System.out.println("Calling user service at: http://localhost:8086/api/users/admin/" + userId);
            UserFeignClient.UserResponse user = userFeignClient.getUserById(userId);
            System.out.println("Successfully fetched user: " + user.getEmail());
            return user;
        } catch (Exception e) {
            System.err.println("Failed to call user service: " + e.getMessage());
            throw new RuntimeException("User not found with ID: " + userId + ". Error: " + e.getMessage());
        }
    }

    /**
     * Check if user exists
     * @param userId User ID
     * @return true if user exists, false otherwise
     */
    public boolean userExists(Long userId) {
        return userId != null && userId > 0;
    }

    private String extractAuthorizationHeader() {
        RequestAttributes attributes = RequestContextHolder.getRequestAttributes();
        if (!(attributes instanceof ServletRequestAttributes servletRequestAttributes)) {
            return null;
        }

        HttpServletRequest request = servletRequestAttributes.getRequest();
        if (request == null) {
            return null;
        }

        return request.getHeader("Authorization");
    }
}
