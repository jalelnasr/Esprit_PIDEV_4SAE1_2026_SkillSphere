package org.example.b2bmodule.service;

import org.example.b2bmodule.dto.EmployeeRequest;
import org.example.b2bmodule.dto.EmployeeResponse;
import org.example.b2bmodule.entity.Company;
import org.example.b2bmodule.entity.Employee;
import org.example.b2bmodule.repository.CompanyRepository;
import org.example.b2bmodule.repository.EmployeeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private CompanyRepository companyRepository;

    @InjectMocks
    private EmployeeService employeeService;

    private Company company;
    private Employee employee;
    private Employee manager;
    private EmployeeRequest request;

    @BeforeEach
    void setUp() {
        company = Company.builder()
                .id(1L)
                .name("Tech Corp")
                .email("contact@techcorp.com")
                .siret("12345678901234")
                .sector("IT")
                .address("123 Main St")
                .phone("+33123456789")
                .creditsRemaining(100)
                .build();

        manager = Employee.builder()
                .id(2L)
                .company(company)
                .department("Engineering")
                .position("Engineering Manager")
                .hireDate(LocalDate.of(2020, 1, 1))
                .build();

        employee = Employee.builder()
                .id(1L)
                .company(company)
                .department("Engineering")
                .position("Senior Developer")
                .manager(manager)
                .hireDate(LocalDate.of(2022, 3, 15))
                .build();

        request = new EmployeeRequest(
                1L,
                1L,
                "Engineering",
                "Senior Developer",
                2L
        );
    }

    @Test
    void shouldCreateEmployee() {
        // Given
        when(companyRepository.findById(1L)).thenReturn(Optional.of(company));
        when(employeeRepository.findById(2L)).thenReturn(Optional.of(manager));
        when(employeeRepository.save(any(Employee.class))).thenReturn(employee);

        // When
        EmployeeResponse response = employeeService.create(request);

        // Then
        assertNotNull(response);
        assertEquals(1L, response.id());
        assertEquals("Tech Corp", response.companyName());
        assertEquals("Engineering", response.department());
        assertEquals("Senior Developer", response.position());
        assertEquals(2L, response.managerId());
        verify(employeeRepository).save(any(Employee.class));
    }

    @Test
    void shouldCreateEmployeeWithoutManager() {
        // Given
        EmployeeRequest requestWithoutManager = new EmployeeRequest(
                1L, 1L, "HR", "HR Director", null
        );
        Employee employeeWithoutManager = Employee.builder()
                .id(1L)
                .company(company)
                .department("HR")
                .position("HR Director")
                .manager(null)
                .build();

        when(companyRepository.findById(1L)).thenReturn(Optional.of(company));
        when(employeeRepository.save(any(Employee.class))).thenReturn(employeeWithoutManager);

        // When
        EmployeeResponse response = employeeService.create(requestWithoutManager);

        // Then
        assertNotNull(response);
        assertNull(response.managerId());
        verify(employeeRepository, never()).findById(anyLong());
    }

    @Test
    void shouldThrowExceptionWhenCompanyNotFound() {
        // Given
        when(companyRepository.findById(999L)).thenReturn(Optional.empty());
        EmployeeRequest invalidRequest = new EmployeeRequest(
                1L, 999L, "Engineering", "Developer", null
        );

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            employeeService.create(invalidRequest);
        });
        assertEquals("Company not found", exception.getMessage());
    }

    @Test
    void shouldThrowExceptionWhenManagerNotFound() {
        // Given
        when(companyRepository.findById(1L)).thenReturn(Optional.of(company));
        when(employeeRepository.findById(999L)).thenReturn(Optional.empty());
        EmployeeRequest invalidRequest = new EmployeeRequest(
                1L, 1L, "Engineering", "Developer", 999L
        );

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            employeeService.create(invalidRequest);
        });
        assertEquals("Manager not found", exception.getMessage());
    }

    @Test
    void shouldFindAllEmployees() {
        // Given
        Employee employee2 = Employee.builder()
                .id(3L)
                .company(company)
                .department("Sales")
                .position("Sales Representative")
                .build();

        when(employeeRepository.findAll()).thenReturn(List.of(employee, employee2));

        // When
        List<EmployeeResponse> employees = employeeService.findAll();

        // Then
        assertNotNull(employees);
        assertEquals(2, employees.size());
        assertEquals("Engineering", employees.get(0).department());
        assertEquals("Sales", employees.get(1).department());
    }

    @Test
    void shouldFindEmployeeById() {
        // Given
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));

        // When
        EmployeeResponse response = employeeService.findById(1L);

        // Then
        assertNotNull(response);
        assertEquals(1L, response.id());
        assertEquals("Senior Developer", response.position());
    }

    @Test
    void shouldThrowExceptionWhenEmployeeNotFound() {
        // Given
        when(employeeRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            employeeService.findById(999L);
        });
        assertEquals("Employee not found", exception.getMessage());
    }

    @Test
    void shouldFindEmployeesByCompany() {
        // Given
        when(employeeRepository.findByCompanyId(1L)).thenReturn(List.of(employee));

        // When
        List<EmployeeResponse> employees = employeeService.findByCompany(1L);

        // Then
        assertNotNull(employees);
        assertEquals(1, employees.size());
        assertEquals(1L, employees.get(0).companyId());
    }

    @Test
    void shouldFindEmployeesByManager() {
        // Given
        when(employeeRepository.findByManagerId(2L)).thenReturn(List.of(employee));

        // When
        List<EmployeeResponse> employees = employeeService.findByManager(2L);

        // Then
        assertNotNull(employees);
        assertEquals(1, employees.size());
        assertEquals(2L, employees.get(0).managerId());
    }

    @Test
    void shouldUpdateEmployee() {
        // Given
        EmployeeRequest updateRequest = new EmployeeRequest(
                1L, 1L, "Engineering", "Lead Developer", 2L
        );

        Employee updatedEmployee = Employee.builder()
                .id(1L)
                .company(company)
                .department("Engineering")
                .position("Lead Developer")
                .manager(manager)
                .build();

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(employeeRepository.findById(2L)).thenReturn(Optional.of(manager));
        when(employeeRepository.save(any(Employee.class))).thenReturn(updatedEmployee);

        // When
        EmployeeResponse response = employeeService.update(1L, updateRequest);

        // Then
        assertNotNull(response);
        assertEquals("Lead Developer", response.position());
        verify(employeeRepository).save(any(Employee.class));
    }

    @Test
    void shouldUpdateOnlyProvidedFields() {
        // Given
        EmployeeRequest partialUpdate = new EmployeeRequest(
                null, null, null, "Tech Lead", null
        );

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(employeeRepository.save(any(Employee.class))).thenReturn(employee);

        // When
        EmployeeResponse response = employeeService.update(1L, partialUpdate);

        // Then
        assertNotNull(response);
        verify(employeeRepository).save(argThat(e -> 
            e.getPosition().equals("Tech Lead") && 
            e.getDepartment().equals("Engineering")
        ));
    }

    @Test
    void shouldUpdateEmployeeDepartment() {
        // Given
        EmployeeRequest updateRequest = new EmployeeRequest(
                null, null, "Product", null, null
        );

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(employeeRepository.save(any(Employee.class))).thenReturn(employee);

        // When
        employeeService.update(1L, updateRequest);

        // Then
        verify(employeeRepository).save(argThat(e -> 
            e.getDepartment().equals("Product")
        ));
    }

    @Test
    void shouldUpdateEmployeeManager() {
        // Given
        Employee newManager = Employee.builder()
                .id(3L)
                .company(company)
                .department("Engineering")
                .position("VP Engineering")
                .build();

        EmployeeRequest updateRequest = new EmployeeRequest(
                null, null, null, null, 3L
        );

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(employeeRepository.findById(3L)).thenReturn(Optional.of(newManager));
        when(employeeRepository.save(any(Employee.class))).thenReturn(employee);

        // When
        employeeService.update(1L, updateRequest);

        // Then
        verify(employeeRepository).save(argThat(e -> 
            e.getManager().getId().equals(3L)
        ));
    }

    @Test
    void shouldThrowExceptionWhenUpdatingNonExistentEmployee() {
        // Given
        when(employeeRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            employeeService.update(999L, request);
        });
        assertEquals("Employee not found", exception.getMessage());
    }

    @Test
    void shouldThrowExceptionWhenUpdatingWithInvalidManager() {
        // Given
        EmployeeRequest updateRequest = new EmployeeRequest(
                null, null, null, null, 999L
        );

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(employeeRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            employeeService.update(1L, updateRequest);
        });
        assertEquals("Manager not found", exception.getMessage());
    }

    @Test
    void shouldDeleteEmployee() {
        // When
        employeeService.delete(1L);

        // Then
        verify(employeeRepository).deleteById(1L);
    }

    @Test
    void shouldReturnEmptyListWhenNoEmployeesForCompany() {
        // Given
        when(employeeRepository.findByCompanyId(999L)).thenReturn(List.of());

        // When
        List<EmployeeResponse> employees = employeeService.findByCompany(999L);

        // Then
        assertNotNull(employees);
        assertTrue(employees.isEmpty());
    }

    @Test
    void shouldReturnEmptyListWhenNoEmployeesForManager() {
        // Given
        when(employeeRepository.findByManagerId(999L)).thenReturn(List.of());

        // When
        List<EmployeeResponse> employees = employeeService.findByManager(999L);

        // Then
        assertNotNull(employees);
        assertTrue(employees.isEmpty());
    }

    @Test
    void shouldHandleEmployeeWithoutManagerInResponse() {
        // Given
        Employee employeeWithoutManager = Employee.builder()
                .id(1L)
                .company(company)
                .department("Executive")
                .position("CEO")
                .manager(null)
                .build();

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employeeWithoutManager));

        // When
        EmployeeResponse response = employeeService.findById(1L);

        // Then
        assertNotNull(response);
        assertNull(response.managerId());
    }

    @Test
    void shouldHandleDifferentDepartments() {
        // Given
        Employee hrEmployee = Employee.builder()
                .id(4L)
                .company(company)
                .department("Human Resources")
                .position("HR Manager")
                .build();

        Employee financeEmployee = Employee.builder()
                .id(5L)
                .company(company)
                .department("Finance")
                .position("Financial Analyst")
                .build();

        when(employeeRepository.findAll()).thenReturn(List.of(hrEmployee, financeEmployee));

        // When
        List<EmployeeResponse> employees = employeeService.findAll();

        // Then
        assertNotNull(employees);
        assertEquals(2, employees.size());
        assertTrue(employees.stream().anyMatch(e -> e.department().equals("Human Resources")));
        assertTrue(employees.stream().anyMatch(e -> e.department().equals("Finance")));
    }
}
