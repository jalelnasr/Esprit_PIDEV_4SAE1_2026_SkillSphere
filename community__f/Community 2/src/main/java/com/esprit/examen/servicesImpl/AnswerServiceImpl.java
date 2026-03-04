package com.esprit.examen.servicesImpl;

import com.esprit.examen.entities.Answer;
import com.esprit.examen.entities.Question;
import com.esprit.examen.services.UserService;
import com.esprit.examen.repositories.AnswerRepository;
import com.esprit.examen.repositories.QuestionRepository;
import com.esprit.examen.services.AnswerService;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AnswerServiceImpl implements AnswerService {

    @Resource
    private AnswerRepository answerRepository;

    @Resource
    private UserService userService;

    @Resource
    private QuestionRepository questionRepository;

    @Override
    public Answer createAnswer(Answer answer, Long userId, Long questionId) {
        if (!userService.userExists(userId)) {
            throw new RuntimeException("User not found with ID: " + userId);
        }
        Question question = questionRepository.findById(questionId).orElse(null);
        answer.setUserId(userId);
        answer.setQuestion(question);
        answer.setCreatedAt(LocalDateTime.now());
        // Don't set answerId - let database auto-generate it
        return answerRepository.save(answer);
    }

    @Override
    public Answer getAnswerById(Long id) {
        return answerRepository.findById(id).orElse(null);
    }

    @Override
    public List<Answer> getAnswersByQuestion(Long questionId) {
        return answerRepository.findByQuestionQuestionId(questionId);
    }

    @Override
    public List<Answer> getAnswersByUser(Long userId) {
        return answerRepository.findByUserId(userId);
    }

    @Override
    public Answer updateAnswer(Long id, Answer answer) {
        Answer existing = answerRepository.findById(id).orElse(null);
        if (existing != null) {
            existing.setContent(answer.getContent());
            return answerRepository.save(existing);
        }
        return null;
    }

    @Override
    public void deleteAnswer(Long id) {
        answerRepository.deleteById(id);
    }
}
