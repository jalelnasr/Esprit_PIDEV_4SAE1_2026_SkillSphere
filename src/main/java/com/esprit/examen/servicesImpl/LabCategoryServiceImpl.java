package com.esprit.examen.servicesImpl;

import com.esprit.examen.entities.LabCategory;
import com.esprit.examen.exceptions.ResourceNotFoundException;
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
        return labCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lab category not found: " + id));
    }

    @Override
    public List<LabCategory> getAllCategories() {
        return labCategoryRepository.findAll();
    }

    @Override
    public LabCategory updateCategory(Long id, LabCategory category) {
        LabCategory existing = labCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lab category not found: " + id));
        existing.setName(category.getName());
        existing.setDescription(category.getDescription());
        existing.setIconUrl(category.getIconUrl());
        return labCategoryRepository.save(existing);
    }

    @Override
    public void deleteCategory(Long id) {
        if (!labCategoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Lab category not found: " + id);
        }
        labCategoryRepository.deleteById(id);
    }
}
