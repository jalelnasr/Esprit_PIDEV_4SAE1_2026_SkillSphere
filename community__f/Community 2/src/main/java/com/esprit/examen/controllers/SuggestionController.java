package com.esprit.examen.controllers;

import com.esprit.examen.dto.SuggestedGroupDTO;
import com.esprit.examen.dto.SuggestedUserDTO;
import com.esprit.examen.services.SuggestionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/suggestions")
@Tag(name = "Suggestions", description = "Suggestion system APIs")
public class SuggestionController {

    private final SuggestionService suggestionService;

    public SuggestionController(SuggestionService suggestionService) {
        this.suggestionService = suggestionService;
    }

    @GetMapping("/users")
    @Operation(summary = "Get top suggested users for the authenticated user")
    public ResponseEntity<List<SuggestedUserDTO>> suggestUsers() {
        return ResponseEntity.ok(suggestionService.suggestUsersForCurrentUser());
    }

    @GetMapping("/groups")
    @Operation(summary = "Get top suggested groups for the authenticated user")
    public ResponseEntity<List<SuggestedGroupDTO>> suggestGroups() {
        return ResponseEntity.ok(suggestionService.suggestGroupsForCurrentUser());
    }
}
