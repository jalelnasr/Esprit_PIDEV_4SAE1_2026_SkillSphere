package org.example.professional_events.repository;

import org.example.professional_events.entity.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {
    List<TeamMember> findByTeam_TeamId(Long teamId);
    Optional<TeamMember> findByTeam_TeamIdAndUserId(Long teamId, Long userId);
    Optional<TeamMember> findByTeam_Competition_CompetitionIdAndUserId(Long competitionId, Long userId);
    boolean existsByTeam_Competition_CompetitionIdAndUserId(Long competitionId, Long userId);
    List<TeamMember> findByUserId(Long userId);
}
