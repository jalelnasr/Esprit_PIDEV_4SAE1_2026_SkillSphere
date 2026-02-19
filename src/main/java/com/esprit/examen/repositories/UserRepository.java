package com.esprit.examen.repositories;

import com.esprit.examen.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    User findByName(String name);

    User findByEmail(String email);

    List<User> findByLevelGreaterThanEqual(Integer level);
}