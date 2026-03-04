package com.esprit.examen.servicesImpl;

import com.esprit.examen.entities.Question;
import com.esprit.examen.services.UserService;
import com.esprit.examen.repositories.QuestionRepository;
import com.esprit.examen.services.QuestionService;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class QuestionServiceImpl implements QuestionService {

    @Resource
    private QuestionRepository questionRepository;

    @Resource
    private UserService userService;

    @Override
    public Question createQuestion(Question question, Long userId) {
        if (!userService.userExists(userId)) {
            throw new RuntimeException("User not found with ID: " + userId);
        }
        question.setUserId(userId);
        question.setCreatedAt(LocalDateTime.now());
        // Don't set questionId - let database auto-generate it
        return questionRepository.save(question);
    }

    @Override
    public Question getQuestionById(Long id) {
        return questionRepository.findById(id).orElse(null);
    }

    @Override
    public List<Question> getAllQuestions() {
        return questionRepository.findAll();
    }

    @Override
    public List<Question> getQuestionsByUser(Long userId) {
        return questionRepository.findByUserId(userId);
    }

    @Override
    public List<Question> searchQuestions(String keyword) {
        return questionRepository.findByTitleContainingIgnoreCase(keyword);
    }

    @Override
    public Question updateQuestion(Long id, Question question) {
        Question existing = questionRepository.findById(id).orElse(null);
        if (existing != null) {
            existing.setTitle(question.getTitle());
            existing.setDescription(question.getDescription());
            return questionRepository.save(existing);
        }
        return null;
    }

    @Override
    public void deleteQuestion(Long id) {
        questionRepository.deleteById(id);
    }
}
