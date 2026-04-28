package org.example.b2bmodule.dto;

// ========== COMPANY ==========
public record CompanyRequest(String name, String email, String siret, String sector, String address, String phone, Long createdBy) {}

