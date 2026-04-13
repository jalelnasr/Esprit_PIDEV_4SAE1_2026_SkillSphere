package org.example.platformeback.user.repository;

import org.example.platformeback.user.model.Role;
import org.example.platformeback.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByEmailAndIdUserNot(String email, Long idUser);

    // ✅ Needed for seeding the first admin
    boolean existsByRole(Role role);
    Optional<User> findByEmailIgnoreCase(String email);

    // ✅ B2B: Filtrage par entreprise
    List<User> findByCompanyId(Long companyId);
    List<User> findByRoleAndCompanyId(Role role, Long companyId);
    List<User> findByCompanyIdAndRoleIn(Long companyId, List<Role> roles);
}