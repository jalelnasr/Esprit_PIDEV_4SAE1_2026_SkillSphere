package com.esprit.examen.repositories;

import com.esprit.examen.entities.Role;
import com.esprit.examen.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdUserNot(String email, Long idUser);

    boolean existsByRole(Role role);

    Optional<User> findByEmailIgnoreCase(String email);

    List<User> findByLevelGreaterThanEqual(Integer level);
}
