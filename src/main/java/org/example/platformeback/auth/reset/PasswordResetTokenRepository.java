package org.example.platformeback.auth.reset;

import org.example.platformeback.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByToken(String token);

    // ✅ instead of deleteAllByUser(user) (needs transaction), we revoke previous tokens
    @Transactional
    @Modifying
    @Query("update PasswordResetToken t set t.used = true where t.user = :user and t.used = false")
    int revokeAllActiveByUser(@Param("user") User user);
}