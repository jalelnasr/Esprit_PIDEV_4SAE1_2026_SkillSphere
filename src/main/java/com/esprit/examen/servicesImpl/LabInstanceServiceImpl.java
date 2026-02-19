package com.esprit.examen.servicesImpl;

import com.esprit.examen.entities.Lab;
import com.esprit.examen.entities.LabInstance;
import com.esprit.examen.entities.User;
import com.esprit.examen.repositories.LabInstanceRepository;
import com.esprit.examen.repositories.LabRepository;
import com.esprit.examen.repositories.UserRepository;
import com.esprit.examen.services.LabInstanceService;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LabInstanceServiceImpl implements LabInstanceService {

    @Resource
    private LabInstanceRepository labInstanceRepository;

    @Resource
    private UserRepository userRepository;

    @Resource
    private LabRepository labRepository;

    @Override
    public LabInstance createLabInstance(LabInstance instance, Long userId, Long labId) {
        User user = userRepository.findById(userId).orElse(null);
        Lab lab = labRepository.findById(labId).orElse(null);
        instance.setUser(user);
        instance.setLab(lab);
        return labInstanceRepository.save(instance);
    }

    @Override
    public LabInstance getLabInstanceById(Long id) {
        return labInstanceRepository.findById(id).orElse(null);
    }

    @Override
    public List<LabInstance> getAllLabInstances() {
        return labInstanceRepository.findAll();
    }

    @Override
    public List<LabInstance> getLabInstancesByUser(Long userId) {
        return labInstanceRepository.findByUserUserId(userId);
    }

    @Override
    public List<LabInstance> getLabInstancesByLab(Long labId) {
        return labInstanceRepository.findByLabLabId(labId);
    }

    @Override
    public List<LabInstance> getLabInstancesByStatus(String status) {
        return labInstanceRepository.findByStatus(status);
    }

    @Override
    public LabInstance updateLabInstance(Long id, LabInstance instance) {
        LabInstance existing = labInstanceRepository.findById(id).orElse(null);
        if (existing != null) {
            existing.setContainerId(instance.getContainerId());
            existing.setContainerName(instance.getContainerName());
            existing.setStatus(instance.getStatus());
            existing.setAccessUrl(instance.getAccessUrl());
            existing.setAssignedPort(instance.getAssignedPort());
            existing.setStartedAt(instance.getStartedAt());
            existing.setStoppedAt(instance.getStoppedAt());
            existing.setCompletedAt(instance.getCompletedAt());
            existing.setErrorMessage(instance.getErrorMessage());
            existing.setScore(instance.getScore());
            return labInstanceRepository.save(existing);
        }
        return null;
    }

    @Override
    public void deleteLabInstance(Long id) {
        labInstanceRepository.deleteById(id);
    }
}