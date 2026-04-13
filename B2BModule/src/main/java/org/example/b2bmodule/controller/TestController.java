package org.example.b2bmodule.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.b2bmodule.service.UserMicroserviceClient;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/b2b/test")
@RequiredArgsConstructor
@Slf4j
public class TestController {

    private final UserMicroserviceClient userMicroserviceClient;

    @GetMapping("/rh/{companyId}")
    public String testGetRH(@PathVariable Long companyId) {
        log.info("Testing getRH for company_id={}", companyId);
        Long rhUserId = userMicroserviceClient.getRhUserIdByCompanyId(companyId);
        
        if (rhUserId != null) {
            return "✅ Found RH user_id=" + rhUserId + " for company_id=" + companyId;
        } else {
            return "❌ No RH found for company_id=" + companyId;
        }
    }
}
