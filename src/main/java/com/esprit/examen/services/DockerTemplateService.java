package com.esprit.examen.services;

import com.esprit.examen.entities.DockerTemplate;

import java.util.List;

public interface DockerTemplateService {

    DockerTemplate createDockerTemplate(DockerTemplate template, Long labId);

    DockerTemplate getDockerTemplateById(Long id);

    DockerTemplate getDockerTemplateByLabId(Long labId);

    List<DockerTemplate> getAllDockerTemplates();

    DockerTemplate updateDockerTemplate(Long id, DockerTemplate template);

    void deleteDockerTemplate(Long id);
}