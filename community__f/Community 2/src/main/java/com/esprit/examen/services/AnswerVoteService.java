package com.esprit.examen.services;

import com.esprit.examen.entities.AnswerVote;

import java.util.List;

public interface AnswerVoteService {
    AnswerVote voteAnswer(Long userId, Long answerId, String voteType);
    void removeVote(Long userId, Long answerId);
    List<AnswerVote> getVotesByAnswer(Long answerId);
}
