package org.example.b2bmodule.service;

import lombok.RequiredArgsConstructor;
import org.example.b2bmodule.dto.*;
import org.example.b2bmodule.entity.Pack;
import org.example.b2bmodule.repository.PackRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PackService {

    private final PackRepository packRepository;

    private PackResponse toResponse(Pack p) {
        return new PackResponse(p.getId(), p.getName(), p.getDescription(), p.getFormationsCount(), p.getPrice(), p.getIsActive());
    }

    public PackResponse create(PackRequest req) {
        Pack p = Pack.builder().name(req.name()).description(req.description()).formationsCount(req.formationsCount()).price(req.price()).isActive(req.isActive() != null ? req.isActive() : true).build();
        return toResponse(packRepository.save(p));
    }

    public List<PackResponse> findAll() { return packRepository.findAll().stream().map(this::toResponse).toList(); }
    public List<PackResponse> findActive() { return packRepository.findByIsActiveTrue().stream().map(this::toResponse).toList(); }
    public PackResponse findById(Long id) { return toResponse(packRepository.findById(id).orElseThrow(() -> new RuntimeException("Pack not found"))); }

    public PackResponse update(Long id, PackRequest req) {
        Pack p = packRepository.findById(id).orElseThrow(() -> new RuntimeException("Pack not found"));
        if (req.name() != null) p.setName(req.name());
        if (req.description() != null) p.setDescription(req.description());
        if (req.formationsCount() != null) p.setFormationsCount(req.formationsCount());
        if (req.price() != null) p.setPrice(req.price());
        if (req.isActive() != null) p.setIsActive(req.isActive());
        return toResponse(packRepository.save(p));
    }

    public void delete(Long id) { packRepository.deleteById(id); }
}

