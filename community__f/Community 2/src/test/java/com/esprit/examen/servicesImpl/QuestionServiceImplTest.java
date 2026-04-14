package com.esprit.examen.servicesImpl;

import com.esprit.examen.entities.Question;
import com.esprit.examen.repositories.QuestionRepository;
import com.esprit.examen.services.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

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
class QuestionServiceImplTest {

    @Mock
    private QuestionRepository questionRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private QuestionServiceImpl questionService;

    @Test
    void createQuestion_setsCreatorAndTimestamp() {
        Question question = new Question();
        question.setTitle("Title");

        when(userService.userExists(4L)).thenReturn(true);
        when(questionRepository.save(any(Question.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Question created = questionService.createQuestion(question, 4L);

        assertEquals(4L, created.getUserId());
        assertNotNull(created.getCreatedAt());
    }

    @Test
    void createQuestion_throwsWhenUserNotFound() {
        when(userService.userExists(99L)).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> questionService.createQuestion(new Question(), 99L));

        assertEquals("User not found with ID: 99", ex.getMessage());
    }

    @Test
    void getQuestionById_returnsEntityOrNull() {
        Question question = new Question();
        question.setQuestionId(10L);

        when(questionRepository.findById(10L)).thenReturn(Optional.of(question));
        when(questionRepository.findById(11L)).thenReturn(Optional.empty());

        assertEquals(10L, questionService.getQuestionById(10L).getQuestionId());
        assertNull(questionService.getQuestionById(11L));
    }

    @Test
    void getAllQuestions_delegatesToRepository() {
        when(questionRepository.findAll()).thenReturn(List.of(new Question(), new Question()));

        assertEquals(2, questionService.getAllQuestions().size());
    }

    @Test
    void getQuestionsByUser_delegatesToRepository() {
        when(questionRepository.findByUserId(7L)).thenReturn(List.of(new Question()));

        assertEquals(1, questionService.getQuestionsByUser(7L).size());
    }

    @Test
    void searchQuestions_delegatesToRepository() {
        when(questionRepository.findByTitleContainingIgnoreCase("java")).thenReturn(List.of(new Question()));

        assertEquals(1, questionService.searchQuestions("java").size());
    }

    @Test
    void updateQuestion_updatesWhenEntityExists() {
        Question existing = new Question();
        existing.setQuestionId(12L);
        existing.setTitle("Old");
        existing.setDescription("Old desc");

        Question payload = new Question();
        payload.setTitle("New");
        payload.setDescription("New desc");

        when(questionRepository.findById(12L)).thenReturn(Optional.of(existing));
        when(questionRepository.save(any(Question.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Question updated = questionService.updateQuestion(12L, payload);

        assertNotNull(updated);
        assertEquals("New", updated.getTitle());
        assertEquals("New desc", updated.getDescription());
    }

    @Test
    void updateQuestion_returnsNullWhenEntityMissing() {
        when(questionRepository.findById(404L)).thenReturn(Optional.empty());

        assertNull(questionService.updateQuestion(404L, new Question()));
    }

    @Test
    void deleteQuestion_deletesById() {
        questionService.deleteQuestion(5L);

        verify(questionRepository).deleteById(5L);
    }
}
