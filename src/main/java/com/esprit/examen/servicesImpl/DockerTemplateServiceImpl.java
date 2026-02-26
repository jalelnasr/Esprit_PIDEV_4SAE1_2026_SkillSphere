package com.esprit.examen.servicesImpl;

import com.esprit.examen.entities.DockerTemplate;
import com.esprit.examen.entities.Lab;
import com.esprit.examen.exceptions.ResourceNotFoundException;
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
        Lab lab = labRepository.findById(labId)
                .orElseThrow(() -> new ResourceNotFoundException("Lab not found: " + labId));
        template.setLab(lab);
        return dockerTemplateRepository.save(template);
    }

    @Override
    public DockerTemplate getDockerTemplateById(Long id) {
        return dockerTemplateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Docker template not found: " + id));
    }

    @Override
    public DockerTemplate getDockerTemplateByLabId(Long labId) {
        DockerTemplate template = dockerTemplateRepository.findByLabLabId(labId);
        if (template == null) {
            throw new ResourceNotFoundException("Docker template not found for lab: " + labId);
        }
        return template;
    }

    @Override
    public List<DockerTemplate> getAllDockerTemplates() {
        return dockerTemplateRepository.findAll();
    }

    @Override
    public DockerTemplate updateDockerTemplate(Long id, DockerTemplate template) {
        DockerTemplate existing = dockerTemplateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Docker template not found: " + id));
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

    @Override
    public void deleteDockerTemplate(Long id) {
        if (!dockerTemplateRepository.existsById(id)) {
            throw new ResourceNotFoundException("Docker template not found: " + id);
        }
        dockerTemplateRepository.deleteById(id);
    }
}
