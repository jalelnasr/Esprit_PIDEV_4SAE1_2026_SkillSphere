package com.esprit.examen.servicesImpl;

import com.esprit.examen.entities.Lab;
import com.esprit.examen.entities.LabCategory;
import com.esprit.examen.repositories.LabCategoryRepository;
import com.esprit.examen.repositories.LabRepository;
import com.esprit.examen.services.LabService;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LabServiceImpl implements LabService {

    @Resource
    private LabRepository labRepository;

    @Resource
    private LabCategoryRepository labCategoryRepository;

    @Override
    public Lab createLab(Lab lab, Long categoryId) {
        LabCategory category = labCategoryRepository.findById(categoryId).orElse(null);
        lab.setCategory(category);
        return labRepository.save(lab);
    }

    @Override
    public Lab getLabById(Long id) {
        return labRepository.findById(id).orElse(null);
    }

    @Override
    public List<Lab> getAllLabs() {
        return labRepository.findAll();
    }

    @Override
    public List<Lab> getLabsByCategory(Long categoryId) {
        return labRepository.findByCategoryCategoryId(categoryId);
    }

    @Override
    public List<Lab> getLabsByDifficulty(String difficulty) {
        return labRepository.findByDifficulty(difficulty);
    }

    @Override
    public List<Lab> getActiveLabs() {
        return labRepository.findByActiveTrue();
    }

    @Override
    public List<Lab> getLabsForUserLevel(Integer level) {
        return labRepository.findByRequiredLevelLessThanEqual(level);
    }

    @Override
    public Lab updateLab(Long id, Lab lab) {
        Lab existing = labRepository.findById(id).orElse(null);
        if (existing != null) {
            existing.setTitle(lab.getTitle());
            existing.setDescription(lab.getDescription());
            existing.setDifficulty(lab.getDifficulty());
            existing.setPoints(lab.getPoints());
            existing.setEstimatedDurationMinutes(lab.getEstimatedDurationMinutes());
            existing.setMaxRuntimeMinutes(lab.getMaxRuntimeMinutes());
            existing.setInstructions(lab.getInstructions());
            existing.setRequiredLevel(lab.getRequiredLevel());
            existing.setActive(lab.getActive());
            return labRepository.save(existing);
        }
        return null;
    }

    @Override
    public void deleteLab(Long id) {
        labRepository.deleteById(id);
    }
}