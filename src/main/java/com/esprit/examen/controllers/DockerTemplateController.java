package com.esprit.examen.controllers;

import com.esprit.examen.entities.DockerTemplate;
import com.esprit.examen.services.DockerTemplateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/docker-templates")
@Tag(name = "Docker Template", description = "Docker template management APIs")
public class DockerTemplateController {

    @Autowired
    private DockerTemplateService dockerTemplateService;

    @PostMapping("/{labId}")
    @Operation(summary = "Create a new Docker template for a lab")
    public ResponseEntity<DockerTemplate> createDockerTemplate(@RequestBody DockerTemplate template, @PathVariable Long labId) {
        return ResponseEntity.ok(dockerTemplateService.createDockerTemplate(template, labId));
    }

    @GetMapping
    @Operation(summary = "Get all Docker templates")
    public ResponseEntity<List<DockerTemplate>> getAllDockerTemplates() {
        return ResponseEntity.ok(dockerTemplateService.getAllDockerTemplates());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a Docker template by ID")
    public ResponseEntity<DockerTemplate> getDockerTemplateById(@PathVariable Long id) {
        return ResponseEntity.ok(dockerTemplateService.getDockerTemplateById(id));
    }

    @GetMapping("/lab/{labId}")
    @Operation(summary = "Get a Docker template by lab ID")
    public ResponseEntity<DockerTemplate> getDockerTemplateByLabId(@PathVariable Long labId) {
        return ResponseEntity.ok(dockerTemplateService.getDockerTemplateByLabId(labId));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a Docker template by ID")
    public ResponseEntity<DockerTemplate> updateDockerTemplate(@PathVariable Long id, @RequestBody DockerTemplate template) {
        return ResponseEntity.ok(dockerTemplateService.updateDockerTemplate(id, template));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a Docker template by ID")
    public ResponseEntity<Void> deleteDockerTemplate(@PathVariable Long id) {
        dockerTemplateService.deleteDockerTemplate(id);
        return ResponseEntity.ok().build();
    }
}