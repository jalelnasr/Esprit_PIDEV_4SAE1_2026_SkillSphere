package org.example.b2bmodule.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.b2bmodule.client.PlatformeBackClient;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service pour communiquer avec PlatformeBack via OpenFeign
 * 
 * Ce service remplace UserMicroserviceClient (qui utilisait RestTemplate)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PlatformeBackService {

    private final PlatformeBackClient platformeBackClient;

    /**
     * Récupérer l'ID du RH d'une entreprise depuis PlatformeBack
     * 
     * @param companyId ID de l'entreprise
     * @return ID du RH ou null si non trouvé
     */
    public Long getRhUserIdByCompanyId(Long companyId) {
        try {
            log.info("🔗 Calling PlatformeBack via Feign for company_id={}", companyId);
            
            List<PlatformeBackClient.UserResponse> rhList = platformeBackClient.getRhUsersByCompanyId(companyId);
            
            if (rhList != null && !rhList.isEmpty()) {
                Long rhUserId = rhList.get(0).idUser();
                log.info("✅ Found RH user_id={} for company_id={}", rhUserId, companyId);
                return rhUserId;
            }
            
            log.warn("⚠️ No RH found for company_id={}", companyId);
            return null;
            
        } catch (feign.FeignException.NotFound e) {
            log.error("❌ Company {} not found in PlatformeBack", companyId);
            return null;
        } catch (feign.FeignException.ServiceUnavailable e) {
            log.error("❌ PlatformeBack service unavailable");
            return null;
        } catch (Exception e) {
            log.error("❌ Error calling PlatformeBack for company_id={}: {}", 
                companyId, e.getMessage());
            return null;
        }
    }

    /**
     * Récupérer tous les utilisateurs RH d'une entreprise
     * 
     * @param companyId ID de l'entreprise
     * @return Liste des utilisateurs RH
     */
    public List<PlatformeBackClient.UserResponse> getRhUsersByCompanyId(Long companyId) {
        try {
            log.info("🔗 Fetching all RH users for company_id={}", companyId);
            return platformeBackClient.getRhUsersByCompanyId(companyId);
        } catch (Exception e) {
            log.error("❌ Error fetching RH users for company_id={}: {}", 
                companyId, e.getMessage());
            return List.of();
        }
    }
}
