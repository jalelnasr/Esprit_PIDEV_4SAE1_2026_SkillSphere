package com.esprit.examen.services;

import com.esprit.examen.entities.LabCategory;

import java.util.List;

public interface LabCategoryService {

    LabCategory createCategory(LabCategory category);

    LabCategory getCategoryById(Long id);

    List<LabCategory> getAllCategories();

    LabCategory updateCategory(Long id, LabCategory category);

    void deleteCategory(Long id);
}