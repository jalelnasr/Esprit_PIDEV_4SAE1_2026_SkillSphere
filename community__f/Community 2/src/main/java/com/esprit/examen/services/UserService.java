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
        return resolveUserIdFromAuthorization(authorizationHeader);
    }

    public Long getCurrentUserIdFromToken(String tokenOrAuthorizationHeader) {
        String authorizationHeader = normalizeAuthorizationHeader(tokenOrAuthorizationHeader);
        return resolveUserIdFromAuthorization(authorizationHeader);
    }

    /**
     * Get user details by ID
     * @param userId User ID
     * @return User details
     * @throws RuntimeException if user not found
     */
    public UserFeignClient.UserResponse getUserById(Long userId) {
        return getUserById(userId, extractAuthorizationHeader());
    }

    public UserFeignClient.UserResponse getUserById(Long userId, String tokenOrAuthorizationHeader) {
        String authorizationHeader = normalizeAuthorizationHeader(tokenOrAuthorizationHeader);

        if (authorizationHeader != null && !authorizationHeader.isBlank()) {
            try {
                return userFeignClient.getUserById(authorizationHeader, userId);
            } catch (Exception ignored) {
                // fallback below
            }

            try {
                UserFeignClient.UserResponse me = userFeignClient.getMe(authorizationHeader);
                if (me != null && me.getIdUser() != null && me.getIdUser().equals(userId)) {
                    return me;
                }
            } catch (Exception ignored) {
                // fallback below
            }
        }

        try {
            return userFeignClient.getUserByIdAdmin(userId);
        } catch (Exception e) {
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

    public String getDisplayName(Long userId) {
        return getDisplayName(userId, extractAuthorizationHeader());
    }

    public String getDisplayName(Long userId, String tokenOrAuthorizationHeader) {
        try {
            UserFeignClient.UserResponse user = getUserById(userId, tokenOrAuthorizationHeader);
            if (user == null) {
                return "User #" + userId;
            }

            String firstName = user.getPrenom() == null ? "" : user.getPrenom().trim();
            String lastName = user.getNom() == null ? "" : user.getNom().trim();
            String fullName = (firstName + " " + lastName).trim();

            if (!fullName.isBlank()) {
                return fullName;
            }

            if (user.getEmail() != null && !user.getEmail().isBlank()) {
                return user.getEmail();
            }
        } catch (Exception ignored) {
            // Use fallback below
        }

        return "User #" + userId;
    }

    private Long resolveUserIdFromAuthorization(String authorizationHeader) {
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

    private String normalizeAuthorizationHeader(String tokenOrAuthorizationHeader) {
        if (tokenOrAuthorizationHeader == null) {
            return null;
        }

        String normalized = tokenOrAuthorizationHeader.trim();
        if (normalized.isEmpty()) {
            return null;
        }

        if (normalized.regionMatches(true, 0, "Bearer ", 0, 7)) {
            return normalized;
        }

        return "Bearer " + normalized;
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
