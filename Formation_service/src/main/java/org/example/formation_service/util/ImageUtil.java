package org.example.formation_service.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.io.InputStream;
import java.util.Base64;

@Slf4j
public class ImageUtil {
    
    /**
     * Convert logo image to Base64 data URI for embedding in emails
     */
    public static String getLogoAsBase64DataUri() {
        try {
            // Try to load logo from classpath
            ClassPathResource resource = new ClassPathResource("static/uploads/images/logo.png");
            
            log.info("🔍 Attempting to load logo from classpath: static/uploads/images/logo.png");
            log.info("📁 Resource exists: {}", resource.exists());
            
            if (!resource.exists()) {
                log.warn("❌ Logo file not found at static/uploads/images/logo.png");
                return null;
            }
            
            try (InputStream inputStream = resource.getInputStream()) {
                byte[] imageBytes = inputStream.readAllBytes();
                String base64Image = Base64.getEncoder().encodeToString(imageBytes);
                String dataUri = "data:image/png;base64," + base64Image;
                log.info("✅ Logo loaded successfully! Size: {} bytes, Base64 length: {}", imageBytes.length, base64Image.length());
                return dataUri;
            }
            
        } catch (IOException e) {
            log.error("❌ Failed to load logo image: {}", e.getMessage(), e);
            return null;
        }
    }
}
