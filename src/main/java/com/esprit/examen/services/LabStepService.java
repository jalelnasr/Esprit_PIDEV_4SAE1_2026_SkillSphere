package com.esprit.examen.services;

import com.esprit.examen.entities.LabStep;

import java.util.List;

public interface LabStepService {

    LabStep createLabStep(LabStep step, Long labId);

    LabStep getLabStepById(Long id);

    List<LabStep> getStepsByLab(Long labId);

    LabStep updateLabStep(Long id, LabStep step);

    void deleteLabStep(Long id);
}