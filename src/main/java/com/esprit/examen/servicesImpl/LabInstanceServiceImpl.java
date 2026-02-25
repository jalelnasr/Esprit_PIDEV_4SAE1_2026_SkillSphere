package com.esprit.examen.servicesImpl;

import com.esprit.examen.entities.DockerTemplate;
import com.esprit.examen.entities.Lab;
import com.esprit.examen.entities.LabInstance;
import com.esprit.examen.entities.User;
import com.esprit.examen.repositories.LabInstanceRepository;
import com.esprit.examen.repositories.LabRepository;
import com.esprit.examen.repositories.UserRepository;
import com.esprit.examen.services.LabInstanceService;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
public class LabInstanceServiceImpl implements LabInstanceService {

    @Resource
    private LabInstanceRepository labInstanceRepository;

    @Resource
    private UserRepository userRepository;

    @Resource
    private LabRepository labRepository;

    @Resource
    private DockerService dockerService;

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
        return labInstanceRepository.findByUserIdUser(userId);
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

    @Override
    public LabInstance startLab(Long userId, Long labId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        Lab lab = labRepository.findById(labId)
                .orElseThrow(() -> new RuntimeException("Lab not found: " + labId));
        DockerTemplate template = lab.getDockerTemplate();
        if (template == null) {
            throw new RuntimeException("No DockerTemplate configured for lab: " + lab.getTitle());
        }

        String containerName = "gamix-lab" + labId + "-user" + userId + "-" + System.currentTimeMillis();

        // Pull the image if needed
        dockerService.pullImage(template.getImageName(), template.getImageVersion());

        // Create and start the container
        DockerService.ContainerInfo containerInfo = dockerService.createAndStartContainer(template, containerName);

        // Create the LabInstance record
        LabInstance instance = new LabInstance();
        instance.setUser(user);
        instance.setLab(lab);
        instance.setContainerId(containerInfo.containerId());
        instance.setContainerName(containerName);
        instance.setAssignedPort(containerInfo.assignedPort());
        instance.setStatus("RUNNING");
        instance.setAccessUrl("http://localhost:" + containerInfo.assignedPort());
        instance.setStartedAt(LocalDateTime.now());

        LabInstance saved = labInstanceRepository.save(instance);
        log.info("Lab started: instance={}, container={}, port={}",
                saved.getInstanceId(), containerInfo.containerId(), containerInfo.assignedPort());
        return saved;
    }

    @Override
    public LabInstance stopLab(Long instanceId) {
        LabInstance instance = labInstanceRepository.findById(instanceId)
                .orElseThrow(() -> new RuntimeException("LabInstance not found: " + instanceId));

        if (instance.getContainerId() != null) {
            dockerService.stopContainer(instance.getContainerId());
            dockerService.removeContainer(instance.getContainerId());
        }

        instance.setStatus("STOPPED");
        instance.setStoppedAt(LocalDateTime.now());

        LabInstance saved = labInstanceRepository.save(instance);
        log.info("Lab stopped: instance={}", saved.getInstanceId());
        return saved;
    }

    @Override
    public LabInstance getLabStatus(Long instanceId) {
        LabInstance instance = labInstanceRepository.findById(instanceId)
                .orElseThrow(() -> new RuntimeException("LabInstance not found: " + instanceId));

        if (instance.getContainerId() != null && !"STOPPED".equals(instance.getStatus())) {
            String dockerStatus = dockerService.getContainerStatus(instance.getContainerId());
            if (!dockerStatus.equals(instance.getStatus())) {
                instance.setStatus(dockerStatus);
                instance = labInstanceRepository.save(instance);
            }
        }
        return instance;
    }
}