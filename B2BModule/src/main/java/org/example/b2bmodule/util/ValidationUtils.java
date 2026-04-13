package org.example.b2bmodule.util;

import org.example.b2bmodule.exception.BusinessException;

public class ValidationUtils {

    public static void requireNonNull(Object obj, String fieldName) {
        if (obj == null) {
            throw new BusinessException(fieldName + " cannot be null");
        }
    }

    public static void requireNonEmpty(String str, String fieldName) {
        if (str == null || str.trim().isEmpty()) {
            throw new BusinessException(fieldName + " cannot be empty");
        }
    }

    public static void requirePositive(Number number, String fieldName) {
        if (number == null || number.doubleValue() <= 0) {
            throw new BusinessException(fieldName + " must be positive");
        }
    }

    public static void requireNonNegative(Number number, String fieldName) {
        if (number == null || number.doubleValue() < 0) {
            throw new BusinessException(fieldName + " cannot be negative");
        }
    }

    public static void requireValidEmail(String email) {
        if (email == null || !email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new BusinessException("Invalid email format");
        }
    }

    private ValidationUtils() {}
}
