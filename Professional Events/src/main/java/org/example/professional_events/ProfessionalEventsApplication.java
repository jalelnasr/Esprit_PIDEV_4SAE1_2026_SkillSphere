package org.example.professional_events;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class ProfessionalEventsApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProfessionalEventsApplication.class, args);
    }

}
