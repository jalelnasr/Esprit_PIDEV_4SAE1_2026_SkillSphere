package com.esprit.examen.repositories;

import com.esprit.examen.entities.PasswordResetToken;
import com.esprit.examen.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByToken(String token);

    @Transactional
    @Modifying
    @Query("update PasswordResetToken t set t.used = true where t.user = :user and t.used = false")
    int revokeAllActiveByUser(@Param("user") User user);
}
