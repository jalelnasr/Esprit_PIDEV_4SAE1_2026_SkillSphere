package com.esprit.examen.repositories;

import com.esprit.examen.entities.DockerTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DockerTemplateRepository extends JpaRepository<DockerTemplate, Long> {

    DockerTemplate findByLabLabId(Long labId);

    DockerTemplate findByImageName(String imageName);
}