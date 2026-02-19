package com.esprit.examen.servicesImpl;

import com.esprit.examen.entities.Lab;
import com.esprit.examen.entities.LabStep;
import com.esprit.examen.repositories.LabRepository;
import com.esprit.examen.repositories.LabStepRepository;
import com.esprit.examen.services.LabStepService;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LabStepServiceImpl implements LabStepService {

    @Resource
    private LabStepRepository labStepRepository;

    @Resource
    private LabRepository labRepository;

    @Override
    public LabStep createLabStep(LabStep step, Long labId) {
        Lab lab = labRepository.findById(labId).orElse(null);
        step.setLab(lab);
        return labStepRepository.save(step);
    }

    @Override
    public LabStep getLabStepById(Long id) {
        return labStepRepository.findById(id).orElse(null);
    }

    @Override
    public List<LabStep> getStepsByLab(Long labId) {
        return labStepRepository.findByLabLabIdOrderByStepNumberAsc(labId);
    }

    @Override
    public LabStep updateLabStep(Long id, LabStep step) {
        LabStep existing = labStepRepository.findById(id).orElse(null);
        if (existing != null) {
            existing.setStepNumber(step.getStepNumber());
            existing.setTitle(step.getTitle());
            existing.setDescription(step.getDescription());
            existing.setHint(step.getHint());
            existing.setFlag(step.getFlag());
            existing.setPoints(step.getPoints());
            return labStepRepository.save(existing);
        }
        return null;
    }

    @Override
    public void deleteLabStep(Long id) {
        labStepRepository.deleteById(id);
    }
}