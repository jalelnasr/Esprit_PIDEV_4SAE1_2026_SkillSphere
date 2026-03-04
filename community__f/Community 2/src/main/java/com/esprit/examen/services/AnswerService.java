package com.esprit.examen.services;

import com.esprit.examen.entities.Answer;

import java.util.List;

public interface AnswerService {
    Answer createAnswer(Answer answer, Long userId, Long questionId);
    Answer getAnswerById(Long id);
    List<Answer> getAnswersByQuestion(Long questionId);
    List<Answer> getAnswersByUser(Long userId);
    Answer updateAnswer(Long id, Answer answer);
    void deleteAnswer(Long id);
}