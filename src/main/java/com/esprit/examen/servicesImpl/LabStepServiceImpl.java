package com.esprit.examen.servicesImpl;

import com.esprit.examen.entities.Lab;
import com.esprit.examen.entities.LabStep;
import com.esprit.examen.exceptions.ResourceNotFoundException;
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
        Lab lab = labRepository.findById(labId)
                .orElseThrow(() -> new ResourceNotFoundException("Lab not found: " + labId));
        step.setLab(lab);
        return labStepRepository.save(step);
    }

    @Override
    public LabStep getLabStepById(Long id) {
        return labStepRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lab step not found: " + id));
    }

    @Override
    public List<LabStep> getStepsByLab(Long labId) {
        return labStepRepository.findByLabLabIdOrderByStepNumberAsc(labId);
    }

    @Override
    public LabStep updateLabStep(Long id, LabStep step) {
        LabStep existing = labStepRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lab step not found: " + id));
        existing.setStepNumber(step.getStepNumber());
        existing.setTitle(step.getTitle());
        existing.setDescription(step.getDescription());
        existing.setHint(step.getHint());
        existing.setFlag(step.getFlag());
        existing.setPoints(step.getPoints());
        return labStepRepository.save(existing);
    }

    @Override
    public void deleteLabStep(Long id) {
        if (!labStepRepository.existsById(id)) {
            throw new ResourceNotFoundException("Lab step not found: " + id);
        }
        labStepRepository.deleteById(id);
    }
}
