package org.example.professional_events.repository;

import org.example.professional_events.entity.SmsTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SmsTemplateRepository extends JpaRepository<SmsTemplate, Long> {
    Optional<SmsTemplate> findByTemplateName(String templateName);
    List<SmsTemplate> findByTemplateType(String templateType);
    List<SmsTemplate> findByIsActiveTrue();
}
