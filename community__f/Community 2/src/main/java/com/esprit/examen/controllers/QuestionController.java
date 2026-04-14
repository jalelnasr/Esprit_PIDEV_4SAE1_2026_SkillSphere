package com.esprit.examen.controllers;

import com.esprit.examen.entities.Question;
import com.esprit.examen.services.QuestionService;
import com.esprit.examen.services.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import org.springframework.http.HttpStatus;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
@Tag(name = "Question", description = "Question management APIs")
public class QuestionController {

    @Autowired
    private QuestionService questionService;

    @Autowired
    private UserService userService;

    @PostMapping
    @Operation(summary = "Create a new question with authenticated user")
    public ResponseEntity<Question> createQuestion(@RequestBody Question question) {
        Long currentUserId = userService.getCurrentUserId();
        return ResponseEntity.ok(questionService.createQuestion(question, currentUserId));
    }

    @PostMapping("/{userId}")
    @Operation(summary = "Create a new question (legacy path with user id)")
    public ResponseEntity<Question> createQuestion(@RequestBody Question question, @PathVariable Long userId) {
        Long currentUserId = userService.getCurrentUserId();
        if (!currentUserId.equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot create question for another user");
        }

        return ResponseEntity.ok(questionService.createQuestion(question, currentUserId));
    }

    @GetMapping
    @Operation(summary = "Get all questions")
    public ResponseEntity<List<Question>> getAllQuestions() {
        return ResponseEntity.ok(questionService.getAllQuestions());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get question by ID")
    public ResponseEntity<Question> getQuestionById(@PathVariable Long id) {
        return ResponseEntity.ok(questionService.getQuestionById(id));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get questions by user")
    public ResponseEntity<List<Question>> getQuestionsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(questionService.getQuestionsByUser(userId));
    }

    @GetMapping("/search")
    @Operation(summary = "Search questions by keyword")
    public ResponseEntity<List<Question>> searchQuestions(@RequestParam String keyword) {
        return ResponseEntity.ok(questionService.searchQuestions(keyword));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update question by ID")
    public ResponseEntity<Question> updateQuestion(@PathVariable Long id, @RequestBody Question question) {
        return ResponseEntity.ok(questionService.updateQuestion(id, question));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete question by ID")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.ok().build();
    }
}
