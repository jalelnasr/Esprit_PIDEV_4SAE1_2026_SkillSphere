package org.example.b2bmodule.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.example.b2bmodule.dto.*;
import org.example.b2bmodule.service.EmployeeService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/b2b/employees")
@RequiredArgsConstructor
@Tag(name = "Employees", description = "Gestion des employés")
public class EmployeeController {

    private final EmployeeService employeeService;

    @PostMapping @ResponseStatus(HttpStatus.CREATED) @Operation(summary = "Ajouter un employé")
    public EmployeeResponse create(@RequestBody EmployeeRequest req) { return employeeService.create(req); }

    @GetMapping @Operation(summary = "Lister tous les employés")
    public List<EmployeeResponse> findAll() { return employeeService.findAll(); }

    @GetMapping("/{id}") @Operation(summary = "Obtenir un employé par ID")
    public EmployeeResponse findById(@PathVariable Long id) { return employeeService.findById(id); }

    @GetMapping("/company/{companyId}") @Operation(summary = "Employés par entreprise")
    public List<EmployeeResponse> findByCompany(@PathVariable Long companyId) { return employeeService.findByCompany(companyId); }

    @GetMapping("/manager/{managerId}") @Operation(summary = "Subordonnés d'un manager")
    public List<EmployeeResponse> findByManager(@PathVariable Long managerId) { return employeeService.findByManager(managerId); }

    @PutMapping("/{id}") @Operation(summary = "Modifier un employé")
    public EmployeeResponse update(@PathVariable Long id, @RequestBody EmployeeRequest req) { return employeeService.update(id, req); }

    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) @Operation(summary = "Supprimer un employé")
    public void delete(@PathVariable Long id) { employeeService.delete(id); }
}

