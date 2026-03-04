package com.esprit.examen.controllers;

import com.esprit.examen.entities.AnswerVote;
import com.esprit.examen.services.AnswerVoteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/answer-votes")
@Tag(name = "Answer Vote", description = "Answer vote management APIs")
public class AnswerVoteController {

    @Autowired
    private AnswerVoteService answerVoteService;

    @PostMapping("/{userId}/{answerId}")
    @Operation(summary = "Vote on an answer")
    public ResponseEntity<AnswerVote> voteAnswer(@PathVariable Long userId, @PathVariable Long answerId, @RequestParam String voteType) {
        return ResponseEntity.ok(answerVoteService.voteAnswer(userId, answerId, voteType));
    }

    @DeleteMapping("/{userId}/{answerId}")
    @Operation(summary = "Remove vote from an answer")
    public ResponseEntity<Void> removeVote(@PathVariable Long userId, @PathVariable Long answerId) {
        answerVoteService.removeVote(userId, answerId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/answer/{answerId}")
    @Operation(summary = "Get votes by answer")
    public ResponseEntity<List<AnswerVote>> getVotesByAnswer(@PathVariable Long answerId) {
        return ResponseEntity.ok(answerVoteService.getVotesByAnswer(answerId));
    }
}