package com.esprit.examen.services;

import com.esprit.examen.dto.AnswerResponseDTO;
import com.esprit.examen.dto.GitHubRepoPreviewDTO;
import com.esprit.examen.entities.Answer;

import java.util.List;

public interface AnswerService {
    Answer createAnswer(Answer answer, Long userId, Long questionId);
    Answer getAnswerById(Long id);
    List<Answer> getAnswersByQuestion(Long questionId);
    List<Answer> getAnswersByUser(Long userId);
    Answer updateAnswer(Long id, Answer answer);
    void deleteAnswer(Long id);

    AnswerResponseDTO toResponse(Answer answer);
    List<AnswerResponseDTO> toResponses(List<Answer> answers);
    GitHubRepoPreviewDTO previewGitHub(String content);
}
