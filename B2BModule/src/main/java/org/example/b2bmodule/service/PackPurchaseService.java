package org.example.b2bmodule.service;

import lombok.RequiredArgsConstructor;
import org.example.b2bmodule.dto.*;
import org.example.b2bmodule.entity.PackPurchase;
import org.example.b2bmodule.repository.*;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PackPurchaseService {

    private final PackPurchaseRepository purchaseRepository;
    private final CompanyRepository companyRepository;
    private final PackRepository packRepository;

    private PackPurchaseResponse toResponse(PackPurchase pp) {
        return new PackPurchaseResponse(pp.getId(), pp.getCompany().getId(), pp.getCompany().getName(), pp.getPack().getId(), pp.getPack().getName(), pp.getTotalAmount(), pp.getPurchaseDate());
    }

    public PackPurchaseResponse create(PackPurchaseRequest req) {
        var company = companyRepository.findById(req.companyId()).orElseThrow(() -> new RuntimeException("Company not found"));
        var pack = packRepository.findById(req.packId()).orElseThrow(() -> new RuntimeException("Pack not found"));
        PackPurchase pp = PackPurchase.builder().company(company).pack(pack).totalAmount(pack.getPrice()).build();
        return toResponse(purchaseRepository.save(pp));
    }

    public List<PackPurchaseResponse> findAll() { return purchaseRepository.findAll().stream().map(this::toResponse).toList(); }
    public PackPurchaseResponse findById(Long id) { return toResponse(purchaseRepository.findById(id).orElseThrow(() -> new RuntimeException("Purchase not found"))); }
    public List<PackPurchaseResponse> findByCompany(Long companyId) { return purchaseRepository.findByCompanyId(companyId).stream().map(this::toResponse).toList(); }
    public void delete(Long id) { purchaseRepository.deleteById(id); }
}

