package com.esprit.apigateway2;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cloud.gateway.config.GatewayProperties;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = {
    "eureka.client.enabled=false",
    "spring.cloud.discovery.enabled=false"
})
class ApiGatewayRoutesTest {

    @Autowired
    private GatewayProperties gatewayProperties;

    @Test
    void shouldExposeExpectedCoreRoutes() {
        List<String> routeIds = gatewayProperties.getRoutes().stream()
            .map(routeDefinition -> routeDefinition.getId())
            .toList();

        assertThat(routeIds).contains(
            "PLATFORMEBACK",
            "community-service",
            "PLATFORMEBACK-AUTH-API"
        );
    }
}
