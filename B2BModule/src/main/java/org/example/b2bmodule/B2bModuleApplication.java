package org.example.b2bmodule;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class B2bModuleApplication {

    public static void main(String[] args) {
        SpringApplication.run(B2bModuleApplication.class, args);
    }
}
