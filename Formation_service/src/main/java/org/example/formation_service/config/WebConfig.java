package org.example.formation_service.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve static files from /uploads/images/** URL pattern
        // Maps to src/main/resources/static/uploads/images/ directory
        registry.addResourceHandler("/uploads/images/**")
                .addResourceLocations("classpath:/static/uploads/images/");
    }
}
