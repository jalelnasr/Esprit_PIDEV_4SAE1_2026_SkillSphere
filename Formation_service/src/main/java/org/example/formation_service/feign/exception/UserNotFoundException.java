package org.example.formation_service.feign.exception;

/**
 * Thrown when PLATFORMEBACK returns 404 for a user lookup.
 * Services catch this and use placeholder data instead of crashing.
 */
public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String message) {
        super(message);
    }
}
