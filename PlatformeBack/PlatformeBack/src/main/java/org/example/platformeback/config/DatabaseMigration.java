package org.example.platformeback.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Order(1) // S'exécute AVANT AdminSeeder
@Slf4j
public class DatabaseMigration implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        try {
            // 1. Vérifier le type actuel de la colonne role
            List<Map<String, Object>> columns = jdbcTemplate.queryForList(
                "SHOW COLUMNS FROM users LIKE 'role'"
            );

            if (!columns.isEmpty()) {
                String columnType = columns.get(0).get("Type").toString();
                log.info("📋 Current role column type: {}", columnType);

                if (columnType.toLowerCase().contains("enum") && !columnType.contains("MANAGER")) {
                    // La colonne est un ENUM sans MANAGER → ajouter MANAGER
                    jdbcTemplate.execute(
                        "ALTER TABLE users MODIFY COLUMN role ENUM('ADMIN','FORMATEUR','APPRENANT','RH_ENTREPRISE','MANAGER') NOT NULL"
                    );
                    log.info("✅ Database migration: MANAGER added to role ENUM");
                } else if (columnType.toLowerCase().contains("manager")) {
                    log.info("✅ MANAGER already exists in role column — skipping migration");
                } else {
                    // VARCHAR ou autre type — pas besoin de modifier
                    log.info("✅ Role column is {} — MANAGER will work automatically", columnType);
                }
            }
        } catch (Exception e) {
            log.warn("⚠️ Database migration error: {}", e.getMessage());
        }
    }
}


