package com.esprit.examen.services;

import com.esprit.examen.entities.Question;

import java.util.List;

public interface QuestionService {
    Question createQuestion(Question question, Long userId);
    Question getQuestionById(Long id);
    List<Question> getAllQuestions();
    List<Question> getQuestionsByUser(Long userId);
    List<Question> searchQuestions(String keyword);
    Question updateQuestion(Long id, Question question);
    void deleteQuestion(Long id);
}
