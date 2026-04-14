package com.esprit.examen.servicesImpl;

import com.esprit.examen.dto.AnswerResponseDTO;
import com.esprit.examen.dto.GitHubRepoPreviewDTO;
import com.esprit.examen.entities.Answer;
import com.esprit.examen.entities.Question;
import com.esprit.examen.repositories.AnswerRepository;
import com.esprit.examen.repositories.QuestionRepository;
import com.esprit.examen.services.GitHubService;
import com.esprit.examen.services.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnswerServiceImplTest {

    @Mock
    private AnswerRepository answerRepository;

    @Mock
    private UserService userService;

    @Mock
    private QuestionRepository questionRepository;

    @Mock
    private GitHubService gitHubService;

    @InjectMocks
    private AnswerServiceImpl answerService;

    @Test
    void createAnswer_setsQuestionUserAndTimestamp() {
        Answer answer = new Answer();
        answer.setContent("new answer");

        Question question = new Question();
        question.setQuestionId(2L);

        when(userService.userExists(9L)).thenReturn(true);
        when(questionRepository.findById(2L)).thenReturn(Optional.of(question));
        when(answerRepository.save(any(Answer.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Answer created = answerService.createAnswer(answer, 9L, 2L);

        assertEquals(9L, created.getUserId());
        assertNotNull(created.getCreatedAt());
        assertNotNull(created.getQuestion());
        assertEquals(2L, created.getQuestion().getQuestionId());
    }

    @Test
    void createAnswer_throwsWhenUserMissing() {
        when(userService.userExists(5L)).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> answerService.createAnswer(new Answer(), 5L, 1L));

        assertEquals("User not found with ID: 5", ex.getMessage());
    }

    @Test
    void getAnswerById_returnsEntityOrNull() {
        Answer answer = new Answer();
        answer.setAnswerId(3L);

        when(answerRepository.findById(3L)).thenReturn(Optional.of(answer));
        when(answerRepository.findById(4L)).thenReturn(Optional.empty());

        assertEquals(3L, answerService.getAnswerById(3L).getAnswerId());
        assertNull(answerService.getAnswerById(4L));
    }

    @Test
    void getAnswersByQuestion_delegates() {
        when(answerRepository.findByQuestionQuestionId(2L)).thenReturn(List.of(new Answer()));

        assertEquals(1, answerService.getAnswersByQuestion(2L).size());
    }

    @Test
    void getAnswersByUser_delegates() {
        when(answerRepository.findByUserId(3L)).thenReturn(List.of(new Answer(), new Answer()));

        assertEquals(2, answerService.getAnswersByUser(3L).size());
    }

    @Test
    void updateAnswer_updatesWhenEntityExists() {
        Answer existing = new Answer();
        existing.setAnswerId(10L);
        existing.setContent("old");

        Answer payload = new Answer();
        payload.setContent("new");

        when(answerRepository.findById(10L)).thenReturn(Optional.of(existing));
        when(answerRepository.save(any(Answer.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Answer updated = answerService.updateAnswer(10L, payload);

        assertNotNull(updated);
        assertEquals("new", updated.getContent());
    }

    @Test
    void updateAnswer_returnsNullWhenMissing() {
        when(answerRepository.findById(77L)).thenReturn(Optional.empty());

        assertNull(answerService.updateAnswer(77L, new Answer()));
    }

    @Test
    void deleteAnswer_delegates() {
        answerService.deleteAnswer(11L);

        verify(answerRepository).deleteById(11L);
    }

    @Test
    void toResponse_handlesNullInput() {
        assertNull(answerService.toResponse(null));
    }

    @Test
    void toResponse_mapsAnswerAndGitHubPreviews() {
        Question question = new Question();
        question.setQuestionId(55L);

        Answer answer = new Answer();
        answer.setAnswerId(1L);
        answer.setContent("see https://github.com/org/repo");
        answer.setCreatedAt(LocalDateTime.now());
        answer.setUserId(8L);
        answer.setQuestion(question);

        GitHubRepoPreviewDTO preview = new GitHubRepoPreviewDTO();
        preview.setRepoName("repo");

        when(gitHubService.resolvePreviewsFromContent(answer.getContent())).thenReturn(List.of(preview));

        AnswerResponseDTO dto = answerService.toResponse(answer);

        assertEquals(1L, dto.getAnswerId());
        assertEquals(55L, dto.getQuestionId());
        assertEquals(1, dto.getGithubPreviews().size());
    }

    @Test
    void toResponses_returnsEmptyForNullOrEmptyInput() {
        assertEquals(0, answerService.toResponses(null).size());
        assertEquals(0, answerService.toResponses(List.of()).size());
    }

    @Test
    void toResponses_mapsEachAnswer() {
        Answer first = new Answer();
        first.setAnswerId(1L);
        first.setContent("a");
        first.setCreatedAt(LocalDateTime.now());
        first.setUserId(3L);

        Answer second = new Answer();
        second.setAnswerId(2L);
        second.setContent("b");
        second.setCreatedAt(LocalDateTime.now());
        second.setUserId(4L);

        when(gitHubService.resolvePreviewsFromContent(any(String.class))).thenReturn(List.of());

        List<AnswerResponseDTO> responses = answerService.toResponses(List.of(first, second));

        assertEquals(2, responses.size());
        assertEquals(1L, responses.get(0).getAnswerId());
        assertEquals(2L, responses.get(1).getAnswerId());
    }

    @Test
    void previewGitHub_delegatesToGitHubService() {
        GitHubRepoPreviewDTO preview = new GitHubRepoPreviewDTO();
        preview.setStatus("OK");
        when(gitHubService.previewFromContent("content")).thenReturn(preview);

        GitHubRepoPreviewDTO result = answerService.previewGitHub("content");

        assertEquals("OK", result.getStatus());
    }
}
