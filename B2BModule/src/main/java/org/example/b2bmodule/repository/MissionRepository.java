package org.example.b2bmodule.repository;

import org.example.b2bmodule.entity.Mission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface MissionRepository extends JpaRepository<Mission, Long> {
    List<Mission> findByCompanyId(Long companyId);
    List<Mission> findByStatus(Mission.MissionStatus status);
    
    /**
     * Charger toutes les missions avec leurs relations (company, applications)
     * Utilise JOIN FETCH pour éviter le problème N+1 et les duplications
     * Note: On ne charge PAS le contract ici car il n'est pas nécessaire pour la liste
     */
    @Query("SELECT DISTINCT m FROM Mission m " +
           "LEFT JOIN FETCH m.company " +
           "LEFT JOIN FETCH m.missionApplications")
    List<Mission> findAllWithRelations();
    
    /**
     * Charger une mission par ID avec ses relations
     * Note: On ne charge PAS le contract ici pour éviter les problèmes de duplication
     */
    @Query("SELECT DISTINCT m FROM Mission m " +
           "LEFT JOIN FETCH m.company " +
           "LEFT JOIN FETCH m.missionApplications " +
           "WHERE m.id = :id")
    Optional<Mission> findByIdWithRelations(Long id);
    
    /**
     * Charger les missions par company avec relations
     */
    @Query("SELECT DISTINCT m FROM Mission m " +
           "LEFT JOIN FETCH m.company " +
           "LEFT JOIN FETCH m.missionApplications " +
           "WHERE m.company.id = :companyId")
    List<Mission> findByCompanyIdWithRelations(Long companyId);
    
    /**
     * Charger les missions par status avec relations
     */
    @Query("SELECT DISTINCT m FROM Mission m " +
           "LEFT JOIN FETCH m.company " +
           "LEFT JOIN FETCH m.missionApplications " +
           "WHERE m.status = :status")
    List<Mission> findByStatusWithRelations(Mission.MissionStatus status);
}

