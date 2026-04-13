package org.example.platformeback;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class PlatformeBackApplication {

    public static void main(String[] args) {
        SpringApplication.run(PlatformeBackApplication.class, args);
    }

}
