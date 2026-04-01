package com.esprit.examen.servicesImpl;

import com.esprit.examen.dto.AnswerResponseDTO;
import com.esprit.examen.dto.GitHubRepoPreviewDTO;
import com.esprit.examen.entities.Answer;
import com.esprit.examen.entities.Question;
import com.esprit.examen.services.UserService;
import com.esprit.examen.repositories.AnswerRepository;
import com.esprit.examen.repositories.QuestionRepository;
import com.esprit.examen.services.AnswerService;
import com.esprit.examen.services.GitHubService;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AnswerServiceImpl implements AnswerService {

    @Resource
    private AnswerRepository answerRepository;

    @Resource
    private UserService userService;

    @Resource
    private QuestionRepository questionRepository;

    @Resource
    private GitHubService gitHubService;

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

    @Override
    public AnswerResponseDTO toResponse(Answer answer) {
        if (answer == null) {
            return null;
        }

        Long questionId = answer.getQuestion() != null ? answer.getQuestion().getQuestionId() : null;
        List<GitHubRepoPreviewDTO> previews = gitHubService.resolvePreviewsFromContent(answer.getContent());

        return new AnswerResponseDTO(
                answer.getAnswerId(),
                answer.getContent(),
                answer.getCreatedAt(),
                answer.getUserId(),
                questionId,
                previews
        );
    }

    @Override
    public List<AnswerResponseDTO> toResponses(List<Answer> answers) {
        if (answers == null || answers.isEmpty()) {
            return Collections.emptyList();
        }

        return answers.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public GitHubRepoPreviewDTO previewGitHub(String content) {
        return gitHubService.previewFromContent(content);
    }
}
