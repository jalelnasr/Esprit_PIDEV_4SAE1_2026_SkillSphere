package com.example.platformevaluationservice.evalution.service;

import com.example.platformevaluationservice.evalution.dto.CreateEvaluation;
import com.example.platformevaluationservice.evalution.model.Evaluation;
import com.example.platformevaluationservice.evalution.model.EvaluationStatus;
import com.example.platformevaluationservice.evalution.repository.EvaluationRepository;
import com.example.platformevaluationservice.evalution.security.SecurityUtils;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EvaluationServiceImplTest {

    @Mock
    private EvaluationRepository repository;

    @Mock
    private SecurityUtils securityUtils;

    @InjectMocks
    private EvaluationServiceImpl service;

    @Test
    void createShouldPersistDraftEvaluationForCurrentUser() {
        CreateEvaluation request = new CreateEvaluation();
        request.setTitle("Angular Basics");
        request.setDescription("Introductory course evaluation");

        when(securityUtils.currentUserId()).thenReturn(7L);
        when(repository.save(any(Evaluation.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Evaluation result = service.create(request);

        ArgumentCaptor<Evaluation> captor = ArgumentCaptor.forClass(Evaluation.class);
        verify(repository).save(captor.capture());

        Evaluation saved = captor.getValue();
        assertEquals("Angular Basics", saved.getTitle());
        assertEquals("Introductory course evaluation", saved.getDescription());
        assertEquals(EvaluationStatus.DRAFT, saved.getStatus());
        assertEquals(7L, saved.getFormateurId());
        assertEquals(EvaluationStatus.DRAFT, result.getStatus());
    }

    @Test
    void getByFormateurShouldReturnEvaluationsForOwner() {
        Evaluation evaluation = new Evaluation();
        evaluation.setId(1L);
        evaluation.setFormateurId(7L);

        when(securityUtils.hasRole("ADMIN")).thenReturn(false);
        when(securityUtils.currentUserId()).thenReturn(7L);
        when(repository.findByFormateurId(7L)).thenReturn(List.of(evaluation));

        List<Evaluation> result = service.getByFormateur(7L);

        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getId());
    }

    @Test
    void getByFormateurShouldRejectOtherUser() {
        when(securityUtils.hasRole("ADMIN")).thenReturn(false);
        when(securityUtils.currentUserId()).thenReturn(9L);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.getByFormateur(7L)
        );

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
    }

    @Test
    void getByIdShouldRejectMissingEvaluation() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.getById(99L)
        );

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    }
}