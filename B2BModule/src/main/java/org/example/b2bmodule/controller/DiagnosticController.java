package org.example.b2bmodule.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.b2bmodule.entity.Company;
import org.example.b2bmodule.repository.CompanyRepository;
import org.example.b2bmodule.repository.NotificationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/b2b/diagnostic")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Diagnostic", description = "Endpoints de diagnostic pour vérifier la configuration")
public class DiagnosticController {

    private final CompanyRepository companyRepository;
    private final NotificationRepository notificationRepository;

    /**
     * Vérifier la configuration des notifications
     */
    @GetMapping("/notifications/check")
    @Operation(summary = "Vérifier la configuration des notifications")
    public ResponseEntity<Map<String, Object>> checkNotificationsConfig() {
        log.info("🔍 Checking notifications configuration...");
        
        Map<String, Object> result = new HashMap<>();
        
        // 1. Vérifier les entreprises
        List<Company> allCompanies = companyRepository.findAll();
        long companiesWithoutRH = allCompanies.stream()
                .filter(c -> c.getCreatedBy() == null)
                .count();
        
        result.put("totalCompanies", allCompanies.size());
        result.put("companiesWithoutRH", companiesWithoutRH);
        result.put("companiesWithRH", allCompanies.size() - companiesWithoutRH);
        
        // 2. Vérifier les notifications
        long totalNotifications = notificationRepository.count();
        result.put("totalNotifications", totalNotifications);
        
        // 3. Statut global
        boolean isConfigured = companiesWithoutRH == 0;
        result.put("isConfigured", isConfigured);
        result.put("status", isConfigured ? "✅ OK" : "⚠️ Configuration requise");
        
        if (!isConfigured) {
            result.put("message", "Certaines entreprises n'ont pas de RH assigné. Utilisez /fix pour corriger.");
        } else {
            result.put("message", "Toutes les entreprises ont un RH assigné. Les notifications fonctionneront correctement.");
        }
        
        log.info("✅ Configuration check completed: {}", result);
        return ResponseEntity.ok(result);
    }

    /**
     * Corriger automatiquement la configuration
     */
    @PostMapping("/notifications/fix")
    @Operation(summary = "Corriger automatiquement la configuration des notifications")
    public ResponseEntity<Map<String, Object>> fixNotificationsConfig(
            @RequestParam(required = false, defaultValue = "22") Long defaultRhUserId) {
        
        log.info("🔧 Fixing notifications configuration with default RH user ID: {}", defaultRhUserId);
        
        Map<String, Object> result = new HashMap<>();
        
        // Trouver toutes les entreprises sans RH
        List<Company> companiesWithoutRH = companyRepository.findAll().stream()
                .filter(c -> c.getCreatedBy() == null)
                .toList();
        
        if (companiesWithoutRH.isEmpty()) {
            result.put("status", "✅ OK");
            result.put("message", "Aucune correction nécessaire. Toutes les entreprises ont déjà un RH assigné.");
            result.put("companiesFixed", 0);
            return ResponseEntity.ok(result);
        }
        
        // Assigner le RH par défaut
        int fixed = 0;
        for (Company company : companiesWithoutRH) {
            company.setCreatedBy(defaultRhUserId);
            companyRepository.save(company);
            fixed++;
            log.info("✅ Fixed company {} - assigned RH user ID: {}", company.getName(), defaultRhUserId);
        }
        
        result.put("status", "✅ Corrigé");
        result.put("message", fixed + " entreprise(s) ont été corrigées. Les notifications fonctionneront maintenant correctement.");
        result.put("companiesFixed", fixed);
        result.put("assignedRhUserId", defaultRhUserId);
        
        log.info("✅ Configuration fixed: {} companies updated", fixed);
        return ResponseEntity.ok(result);
    }

    /**
     * Obtenir les détails de toutes les entreprises
     */
    @GetMapping("/companies")
    @Operation(summary = "Obtenir les détails de toutes les entreprises")
    public ResponseEntity<List<Map<String, Object>>> getCompaniesDetails() {
        List<Company> companies = companyRepository.findAll();
        
        List<Map<String, Object>> details = companies.stream()
                .map(c -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", c.getId());
                    map.put("name", c.getName());
                    map.put("createdBy", c.getCreatedBy());
                    map.put("status", c.getCreatedBy() != null ? "✅ OK" : "❌ Pas de RH");
                    return map;
                })
                .toList();
        
        return ResponseEntity.ok(details);
    }
}
