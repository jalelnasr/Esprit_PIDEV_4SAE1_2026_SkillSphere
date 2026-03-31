package org.example.formation_service.service;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

/**
 * OTP (One-Time Password) Service
 * 
 * Generates and verifies 6-digit OTP codes sent via email.
 * OTPs expire after 10 minutes for security.
 */
@Service
@Slf4j
public class OtpService {
    
    private final Map<String, OtpData> otpStore = new ConcurrentHashMap<>();
    private final Random random = new Random();
    
    /**
     * Generate a 6-digit OTP code for the given email
     */
    public String generateOtp(String email) {
        // Generate 6-digit code
        String code = String.format("%06d", random.nextInt(999999));
        
        // Store with 10-minute expiration
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(10);
        otpStore.put(email.toLowerCase(), new OtpData(code, expiresAt));
        
        log.info("🔐 OTP generated for {}: {} (expires at {})", email, code, expiresAt);
        return code;
    }
    
    /**
     * Verify OTP code for the given email
     * Returns true if code is valid and not expired
     */
    public boolean verifyOtp(String email, String code) {
        String emailKey = email.toLowerCase();
        OtpData data = otpStore.get(emailKey);
        
        if (data == null) {
            log.warn("❌ OTP verification failed: No OTP found for {}", email);
            return false;
        }
        
        // Check expiration
        if (data.getExpiresAt().isBefore(LocalDateTime.now())) {
            log.warn("❌ OTP verification failed: OTP expired for {}", email);
            otpStore.remove(emailKey);
            return false;
        }
        
        // Verify code
        boolean valid = data.getCode().equals(code);
        
        if (valid) {
            log.info("✅ OTP verified successfully for {}", email);
            otpStore.remove(emailKey); // Remove after successful verification
        } else {
            log.warn("❌ OTP verification failed: Invalid code for {}", email);
        }
        
        return valid;
    }
    
    /**
     * Check if OTP exists and is not expired
     */
    public boolean hasValidOtp(String email) {
        OtpData data = otpStore.get(email.toLowerCase());
        if (data == null) return false;
        return data.getExpiresAt().isAfter(LocalDateTime.now());
    }
    
    /**
     * Remove OTP for email (useful for cleanup)
     */
    public void removeOtp(String email) {
        otpStore.remove(email.toLowerCase());
    }
    
    /**
     * Clean up expired OTPs (can be called periodically)
     */
    public void cleanupExpiredOtps() {
        LocalDateTime now = LocalDateTime.now();
        otpStore.entrySet().removeIf(entry -> entry.getValue().getExpiresAt().isBefore(now));
        log.info("🧹 Cleaned up expired OTPs");
    }
    
    @Data
    @AllArgsConstructor
    private static class OtpData {
        private String code;
        private LocalDateTime expiresAt;
    }
}
