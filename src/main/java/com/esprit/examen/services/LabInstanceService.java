package com.esprit.examen.services;

import com.esprit.examen.entities.LabInstance;

import java.util.List;

public interface LabInstanceService {

    LabInstance createLabInstance(LabInstance instance, Long userId, Long labId);

    LabInstance getLabInstanceById(Long id);

    List<LabInstance> getAllLabInstances();

    List<LabInstance> getLabInstancesByUser(Long userId);

    List<LabInstance> getLabInstancesByLab(Long labId);

    List<LabInstance> getLabInstancesByStatus(String status);

    LabInstance updateLabInstance(Long id, LabInstance instance);

    void deleteLabInstance(Long id);

    LabInstance startLab(Long userId, Long labId);

    LabInstance stopLab(Long instanceId);

    LabInstance getLabStatus(Long instanceId);
}