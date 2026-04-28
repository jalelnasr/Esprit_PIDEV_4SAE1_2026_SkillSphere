package org.example.b2bmodule.repository;

import org.example.b2bmodule.entity.Pack;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PackRepository extends JpaRepository<Pack, Long> {
    List<Pack> findByIsActiveTrue();
}

