package com.esprit.examen.controllers;

import com.esprit.examen.entities.AnswerVote;
import com.esprit.examen.services.AnswerVoteService;
import com.esprit.examen.services.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/answer-votes")
@Tag(name = "Answer Vote", description = "Answer vote management APIs")
public class AnswerVoteController {

    @Autowired
    private AnswerVoteService answerVoteService;

    @Autowired
    private UserService userService;

    @PostMapping("/{answerId}")
    @Operation(summary = "Vote on an answer with authenticated user")
    public ResponseEntity<AnswerVote> voteAnswer(@PathVariable Long answerId, @RequestParam String voteType) {
        Long currentUserId = userService.getCurrentUserId();
        return ResponseEntity.ok(answerVoteService.voteAnswer(currentUserId, answerId, voteType));
    }

    @PostMapping("/{userId}/{answerId}")
    @Operation(summary = "Vote on an answer (legacy path with user id)")
    public ResponseEntity<AnswerVote> voteAnswer(@PathVariable Long userId, @PathVariable Long answerId, @RequestParam String voteType) {
        Long currentUserId = userService.getCurrentUserId();
        if (!currentUserId.equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot vote for another user");
        }

        return ResponseEntity.ok(answerVoteService.voteAnswer(currentUserId, answerId, voteType));
    }

    @DeleteMapping("/{answerId}")
    @Operation(summary = "Remove vote from an answer with authenticated user")
    public ResponseEntity<Void> removeVote(@PathVariable Long answerId) {
        Long currentUserId = userService.getCurrentUserId();
        answerVoteService.removeVote(currentUserId, answerId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{userId}/{answerId}")
    @Operation(summary = "Remove vote from an answer (legacy path with user id)")
    public ResponseEntity<Void> removeVote(@PathVariable Long userId, @PathVariable Long answerId) {
        Long currentUserId = userService.getCurrentUserId();
        if (!currentUserId.equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot remove vote for another user");
        }

        answerVoteService.removeVote(currentUserId, answerId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/answer/{answerId}")
    @Operation(summary = "Get votes by answer")
    public ResponseEntity<List<AnswerVote>> getVotesByAnswer(@PathVariable Long answerId) {
        return ResponseEntity.ok(answerVoteService.getVotesByAnswer(answerId));
    }
}
