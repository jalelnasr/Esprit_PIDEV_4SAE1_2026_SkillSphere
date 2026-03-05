package org.example.professional_events.repository;

import org.example.professional_events.entity.UserContact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserContactRepository extends JpaRepository<UserContact, Long> {
    Optional<UserContact> findByUserId(Long userId);
    Optional<UserContact> findByPhoneNumber(String phoneNumber);
    List<UserContact> findByUserIdIn(List<Long> userIds);
    List<UserContact> findBySmsNotificationsEnabledTrue();
}
