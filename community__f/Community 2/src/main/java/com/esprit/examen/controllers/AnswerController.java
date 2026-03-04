package com.esprit.examen.controllers;

import com.esprit.examen.entities.Answer;
import com.esprit.examen.services.AnswerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/answers")
@Tag(name = "Answer", description = "Answer management APIs")
public class AnswerController {

    @Autowired
    private AnswerService answerService;

    @PostMapping("/{userId}/{questionId}")
    @Operation(summary = "Create a new answer")
    public ResponseEntity<Answer> createAnswer(@RequestBody Answer answer, @PathVariable Long userId, @PathVariable Long questionId) {
        return ResponseEntity.ok(answerService.createAnswer(answer, userId, questionId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get answer by ID")
    public ResponseEntity<Answer> getAnswerById(@PathVariable Long id) {
        return ResponseEntity.ok(answerService.getAnswerById(id));
    }

    @GetMapping("/question/{questionId}")
    @Operation(summary = "Get answers by question")
    public ResponseEntity<List<Answer>> getAnswersByQuestion(@PathVariable Long questionId) {
        return ResponseEntity.ok(answerService.getAnswersByQuestion(questionId));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get answers by user")
    public ResponseEntity<List<Answer>> getAnswersByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(answerService.getAnswersByUser(userId));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update answer by ID")
    public ResponseEntity<Answer> updateAnswer(@PathVariable Long id, @RequestBody Answer answer) {
        return ResponseEntity.ok(answerService.updateAnswer(id, answer));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete answer by ID")
    public ResponseEntity<Void> deleteAnswer(@PathVariable Long id) {
        answerService.deleteAnswer(id);
        return ResponseEntity.ok().build();
    }
}