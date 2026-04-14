package com.esprit.examen.servicesImpl;

import com.esprit.examen.entities.Answer;
import com.esprit.examen.entities.AnswerVote;
import com.esprit.examen.repositories.AnswerRepository;
import com.esprit.examen.repositories.AnswerVoteRepository;
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
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnswerVoteServiceImplTest {

    @Mock
    private AnswerVoteRepository answerVoteRepository;

    @Mock
    private UserService userService;

    @Mock
    private AnswerRepository answerRepository;

    @InjectMocks
    private AnswerVoteServiceImpl answerVoteService;

    @Test
    void voteAnswer_throwsWhenUserMissing() {
        when(userService.userExists(1L)).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> answerVoteService.voteAnswer(1L, 2L, "UP"));

        assertEquals("User not found with ID: 1", ex.getMessage());
    }

    @Test
    void voteAnswer_throwsWhenAnswerMissing() {
        when(userService.userExists(1L)).thenReturn(true);
        when(answerRepository.findById(2L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> answerVoteService.voteAnswer(1L, 2L, "UP"));

        assertEquals("Answer not found with ID: 2", ex.getMessage());
    }

    @Test
    void voteAnswer_updatesExistingVote() {
        Answer answer = new Answer();
        answer.setAnswerId(2L);

        AnswerVote existingVote = new AnswerVote();
        existingVote.setAnswerVoteId(3L);
        existingVote.setVoteType("DOWN");

        when(userService.userExists(1L)).thenReturn(true);
        when(answerRepository.findById(2L)).thenReturn(Optional.of(answer));
        when(answerVoteRepository.findByUserIdAndAnswerAnswerId(1L, 2L)).thenReturn(existingVote);
        when(answerVoteRepository.save(any(AnswerVote.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AnswerVote updated = answerVoteService.voteAnswer(1L, 2L, "UP");

        assertEquals(3L, updated.getAnswerVoteId());
        assertEquals("UP", updated.getVoteType());
        assertNotNull(updated.getCreatedAt());
    }

    @Test
    void voteAnswer_createsNewVoteWhenMissing() {
        Answer answer = new Answer();
        answer.setAnswerId(2L);

        when(userService.userExists(1L)).thenReturn(true);
        when(answerRepository.findById(2L)).thenReturn(Optional.of(answer));
        when(answerVoteRepository.findByUserIdAndAnswerAnswerId(1L, 2L)).thenReturn(null);
        when(answerVoteRepository.save(any(AnswerVote.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AnswerVote created = answerVoteService.voteAnswer(1L, 2L, "UP");

        assertEquals(1L, created.getUserId());
        assertEquals("UP", created.getVoteType());
        assertNotNull(created.getAnswer());
    }

    @Test
    void removeVote_deletesExistingVote() {
        AnswerVote existing = new AnswerVote();
        when(answerVoteRepository.findByUserIdAndAnswerAnswerId(1L, 2L)).thenReturn(existing);

        answerVoteService.removeVote(1L, 2L);

        verify(answerVoteRepository).delete(existing);
    }

    @Test
    void removeVote_noopWhenVoteMissing() {
        when(answerVoteRepository.findByUserIdAndAnswerAnswerId(1L, 2L)).thenReturn(null);

        answerVoteService.removeVote(1L, 2L);

        verify(answerVoteRepository, never()).delete(any(AnswerVote.class));
    }

    @Test
    void getVotesByAnswer_delegates() {
        when(answerVoteRepository.findByAnswerAnswerId(99L)).thenReturn(List.of(new AnswerVote()));

        assertEquals(1, answerVoteService.getVotesByAnswer(99L).size());
    }
}
