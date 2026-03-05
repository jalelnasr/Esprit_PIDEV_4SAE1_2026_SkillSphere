package org.example.professional_events.repository;

import org.example.professional_events.entity.Jury;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JuryRepository extends JpaRepository<Jury, Long> {
    List<Jury> findByExpertise(String expertise);
}

