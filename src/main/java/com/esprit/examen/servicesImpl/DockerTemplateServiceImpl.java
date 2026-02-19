package com.esprit.examen.servicesImpl;

import com.esprit.examen.entities.DockerTemplate;
import com.esprit.examen.entities.Lab;
import com.esprit.examen.repositories.DockerTemplateRepository;
import com.esprit.examen.repositories.LabRepository;
import com.esprit.examen.services.DockerTemplateService;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DockerTemplateServiceImpl implements DockerTemplateService {

    @Resource
    private DockerTemplateRepository dockerTemplateRepository;

    @Resource
    private LabRepository labRepository;

    @Override
    public DockerTemplate createDockerTemplate(DockerTemplate template, Long labId) {
        Lab lab = labRepository.findById(labId).orElse(null);
        template.setLab(lab);
        return dockerTemplateRepository.save(template);
    }

    @Override
    public DockerTemplate getDockerTemplateById(Long id) {
        return dockerTemplateRepository.findById(id).orElse(null);
    }

    @Override
    public DockerTemplate getDockerTemplateByLabId(Long labId) {
        return dockerTemplateRepository.findByLabLabId(labId);
    }

    @Override
    public List<DockerTemplate> getAllDockerTemplates() {
        return dockerTemplateRepository.findAll();
    }

    @Override
    public DockerTemplate updateDockerTemplate(Long id, DockerTemplate template) {
        DockerTemplate existing = dockerTemplateRepository.findById(id).orElse(null);
        if (existing != null) {
            existing.setImageName(template.getImageName());
            existing.setImageVersion(template.getImageVersion());
            existing.setExposedPorts(template.getExposedPorts());
            existing.setEnvironmentVariables(template.getEnvironmentVariables());
            existing.setCpuLimit(template.getCpuLimit());
            existing.setMemoryLimitMb(template.getMemoryLimitMb());
            existing.setNetworkMode(template.getNetworkMode());
            existing.setVolumeMounts(template.getVolumeMounts());
            existing.setStartupCommand(template.getStartupCommand());
            return dockerTemplateRepository.save(existing);
        }
        return null;
    }

    @Override
    public void deleteDockerTemplate(Long id) {
        dockerTemplateRepository.deleteById(id);
    }
}