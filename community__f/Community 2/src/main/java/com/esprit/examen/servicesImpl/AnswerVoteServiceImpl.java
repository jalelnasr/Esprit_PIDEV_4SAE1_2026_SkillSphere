package com.esprit.examen.servicesImpl;

import com.esprit.examen.entities.Answer;
import com.esprit.examen.entities.AnswerVote;
import com.esprit.examen.services.UserService;
import com.esprit.examen.repositories.AnswerVoteRepository;
import com.esprit.examen.repositories.AnswerRepository;
import com.esprit.examen.services.AnswerVoteService;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AnswerVoteServiceImpl implements AnswerVoteService {

    @Resource
    private AnswerVoteRepository answerVoteRepository;

    @Resource
    private UserService userService;

    @Resource
    private AnswerRepository answerRepository;

    @Override
    public AnswerVote voteAnswer(Long userId, Long answerId, String voteType) {
        if (!userService.userExists(userId)) {
            throw new RuntimeException("User not found with ID: " + userId);
        }

        Answer answer = answerRepository.findById(answerId).orElse(null);
        if (answer == null) {
            throw new RuntimeException("Answer not found with ID: " + answerId);
        }

        AnswerVote existingVote = answerVoteRepository.findByUserIdAndAnswerAnswerId(userId, answerId);
        if (existingVote != null) {
            existingVote.setVoteType(voteType);
            existingVote.setCreatedAt(LocalDateTime.now());
            return answerVoteRepository.save(existingVote);
        }

        AnswerVote answerVote = new AnswerVote();
        answerVote.setUserId(userId);
        answerVote.setAnswer(answer);
        answerVote.setVoteType(voteType);
        answerVote.setCreatedAt(LocalDateTime.now());
        // Don't set answerVoteId - let database auto-generate it
        return answerVoteRepository.save(answerVote);
    }

    @Override
    public void removeVote(Long userId, Long answerId) {
        AnswerVote answerVote = answerVoteRepository.findByUserIdAndAnswerAnswerId(userId, answerId);
        if (answerVote != null) {
            answerVoteRepository.delete(answerVote);
        }
    }

    @Override
    public List<AnswerVote> getVotesByAnswer(Long answerId) {
        return answerVoteRepository.findByAnswerAnswerId(answerId);
    }
}
