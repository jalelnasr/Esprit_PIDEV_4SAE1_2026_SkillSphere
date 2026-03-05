package org.example.b2bmodule.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI b2bOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("B2B Corporate Module API")
                        .description("Module B2B - Gestion des entreprises, employés, formations, recrutement et freelances")
                        .version("1.0.0"));
    }
}

