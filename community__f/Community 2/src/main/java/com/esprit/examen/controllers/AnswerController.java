package com.esprit.examen.controllers;

import com.esprit.examen.dto.AnswerResponseDTO;
import com.esprit.examen.dto.GitHubRepoPreviewDTO;
import com.esprit.examen.entities.Answer;
import com.esprit.examen.services.AnswerService;
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
@RequestMapping("/api/answers")
@Tag(name = "Answer", description = "Answer management APIs")
public class AnswerController {

    @Autowired
    private AnswerService answerService;

    @Autowired
    private UserService userService;

    @PostMapping("/{questionId}")
    @Operation(summary = "Create a new answer with authenticated user")
    public ResponseEntity<AnswerResponseDTO> createAnswer(@RequestBody Answer answer, @PathVariable Long questionId) {
        Long currentUserId = userService.getCurrentUserId();
        Answer created = answerService.createAnswer(answer, currentUserId, questionId);
        return ResponseEntity.ok(answerService.toResponse(created));
    }

    @PostMapping("/{userId}/{questionId}")
    @Operation(summary = "Create a new answer (legacy path with user id)")
    public ResponseEntity<AnswerResponseDTO> createAnswer(@RequestBody Answer answer, @PathVariable Long userId, @PathVariable Long questionId) {
        Long currentUserId = userService.getCurrentUserId();
        if (!currentUserId.equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot create answer for another user");
        }

        Answer created = answerService.createAnswer(answer, currentUserId, questionId);
        return ResponseEntity.ok(answerService.toResponse(created));
    }

    @GetMapping("/github-preview")
    @Operation(summary = "Preview GitHub repository details from answer content")
    public ResponseEntity<GitHubRepoPreviewDTO> previewGitHub(@RequestParam String content) {
        return ResponseEntity.ok(answerService.previewGitHub(content));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get answer by ID")
    public ResponseEntity<AnswerResponseDTO> getAnswerById(@PathVariable Long id) {
        return ResponseEntity.ok(answerService.toResponse(answerService.getAnswerById(id)));
    }

    @GetMapping("/question/{questionId}")
    @Operation(summary = "Get answers by question")
    public ResponseEntity<List<AnswerResponseDTO>> getAnswersByQuestion(@PathVariable Long questionId) {
        return ResponseEntity.ok(answerService.toResponses(answerService.getAnswersByQuestion(questionId)));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get answers by user")
    public ResponseEntity<List<AnswerResponseDTO>> getAnswersByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(answerService.toResponses(answerService.getAnswersByUser(userId)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update answer by ID")
    public ResponseEntity<AnswerResponseDTO> updateAnswer(@PathVariable Long id, @RequestBody Answer answer) {
        return ResponseEntity.ok(answerService.toResponse(answerService.updateAnswer(id, answer)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete answer by ID")
    public ResponseEntity<Void> deleteAnswer(@PathVariable Long id) {
        answerService.deleteAnswer(id);
        return ResponseEntity.ok().build();
    }
}
