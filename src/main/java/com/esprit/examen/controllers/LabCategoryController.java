package com.esprit.examen.controllers;

import com.esprit.examen.entities.LabCategory;
import com.esprit.examen.services.LabCategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@Tag(name = "Lab Category", description = "Lab category management APIs")
public class LabCategoryController {

    @Autowired
    private LabCategoryService labCategoryService;

    @PostMapping
    @Operation(summary = "Create a new lab category")
    public ResponseEntity<LabCategory> createCategory(@RequestBody LabCategory category) {
        return ResponseEntity.ok(labCategoryService.createCategory(category));
    }

    @GetMapping
    @Operation(summary = "Get all lab categories")
    public ResponseEntity<List<LabCategory>> getAllCategories() {
        return ResponseEntity.ok(labCategoryService.getAllCategories());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a lab category by ID")
    public ResponseEntity<LabCategory> getCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(labCategoryService.getCategoryById(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a lab category by ID")
    public ResponseEntity<LabCategory> updateCategory(@PathVariable Long id, @RequestBody LabCategory category) {
        return ResponseEntity.ok(labCategoryService.updateCategory(id, category));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a lab category by ID")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        labCategoryService.deleteCategory(id);
        return ResponseEntity.ok().build();
    }
}