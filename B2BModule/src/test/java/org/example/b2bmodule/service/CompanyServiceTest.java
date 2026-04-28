package org.example.b2bmodule.service;

import org.example.b2bmodule.dto.CompanyRequest;
import org.example.b2bmodule.dto.CompanyResponse;
import org.example.b2bmodule.entity.Company;
import org.example.b2bmodule.repository.CompanyRepository;
import org.example.b2bmodule.repository.EmployeeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CompanyService - Tests Unitaires")
class CompanyServiceTest {

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @InjectMocks
    private CompanyService companyService;

    private Company testCompany;
    private CompanyRequest testRequest;

    @BeforeEach
    void setUp() {
        testCompany = Company.builder()
                .id(1L)
                .name("TechCorp")
                .email("contact@techcorp.com")
                .phone("0123456789")
                .address("123 Tech Street")
                .sector("IT")
                .build();

        testRequest = new CompanyRequest(
                "TechCorp",
                "contact@techcorp.com",
                "12345678901234",  // SIRET
                "IT",              // sector
                "123 Tech Street", // address
                "0123456789",      // phone
                1L                 // createdBy
        );
    }

    @Test
    @DisplayName("Créer une company - Succès")
    void testCreate_Success() {
        when(companyRepository.save(any(Company.class))).thenReturn(testCompany);
        when(employeeRepository.countByCompanyId(anyLong())).thenReturn(0L);

        CompanyResponse result = companyService.create(testRequest);

        assertThat(result).isNotNull();
        assertThat(result.name()).isEqualTo("TechCorp");
        assertThat(result.email()).isEqualTo("contact@techcorp.com");
        verify(companyRepository, times(1)).save(any(Company.class));
    }

    @Test
    @DisplayName("Lister toutes les companies")
    void testFindAll() {
        Company company2 = Company.builder()
                .id(2L)
                .name("DataCorp")
                .email("info@datacorp.com")
                .build();

        when(companyRepository.findAll()).thenReturn(Arrays.asList(testCompany, company2));
        when(employeeRepository.countByCompanyId(anyLong())).thenReturn(0L);

        List<CompanyResponse> results = companyService.findAll();

        assertThat(results).hasSize(2);
        assertThat(results.get(0).name()).isEqualTo("TechCorp");
        assertThat(results.get(1).name()).isEqualTo("DataCorp");
        verify(companyRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Trouver par ID - Succès")
    void testFindById_Success() {
        when(companyRepository.findById(1L)).thenReturn(Optional.of(testCompany));
        when(employeeRepository.countByCompanyId(1L)).thenReturn(5L);

        CompanyResponse result = companyService.findById(1L);

        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(1L);
        verify(companyRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("Trouver par ID - Non trouvée")
    void testFindById_NotFound() {
        when(companyRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> companyService.findById(999L))
                .isInstanceOf(RuntimeException.class);
        verify(companyRepository, times(1)).findById(999L);
    }

    @Test
    @DisplayName("Supprimer une company")
    void testDelete() {
        doNothing().when(companyRepository).deleteById(1L);

        companyService.delete(1L);

        verify(companyRepository, times(1)).deleteById(1L);
    }
}
