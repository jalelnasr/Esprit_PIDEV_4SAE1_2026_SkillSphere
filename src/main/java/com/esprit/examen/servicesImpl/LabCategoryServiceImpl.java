package com.esprit.examen.servicesImpl;

import com.esprit.examen.entities.LabCategory;
import com.esprit.examen.repositories.LabCategoryRepository;
import com.esprit.examen.services.LabCategoryService;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LabCategoryServiceImpl implements LabCategoryService {

    @Resource
    private LabCategoryRepository labCategoryRepository;

    @Override
    public LabCategory createCategory(LabCategory category) {
        return labCategoryRepository.save(category);
    }

    @Override
    public LabCategory getCategoryById(Long id) {
        return labCategoryRepository.findById(id).orElse(null);
    }

    @Override
    public List<LabCategory> getAllCategories() {
        return labCategoryRepository.findAll();
    }

    @Override
    public LabCategory updateCategory(Long id, LabCategory category) {
        LabCategory existing = labCategoryRepository.findById(id).orElse(null);
        if (existing != null) {
            existing.setName(category.getName());
            existing.setDescription(category.getDescription());
            existing.setIconUrl(category.getIconUrl());
            return labCategoryRepository.save(existing);
        }
        return null;
    }

    @Override
    public void deleteCategory(Long id) {
        labCategoryRepository.deleteById(id);
    }
}