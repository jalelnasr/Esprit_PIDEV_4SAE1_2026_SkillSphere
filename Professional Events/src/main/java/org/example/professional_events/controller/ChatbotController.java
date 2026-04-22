package org.example.professional_events.controller;

import org.example.professional_events.service.ChatbotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chatbot")
@CrossOrigin(origins = "http://localhost:4200")
public class ChatbotController {

    @Autowired
    private ChatbotService chatbotService;

    /**
     * Endpoint pour poser une question au chatbot
     */
    @PostMapping("/ask")
    public Map<String, Object> askQuestion(@RequestBody Map<String, String> request) {
        String question = request.get("question");
        
        if (question == null || question.trim().isEmpty()) {
            return Map.of(
                "success", false,
                "message", "Question vide"
            );
        }

        // Extraire la question (enlever @bot si présent)
        String cleanQuestion = chatbotService.extractQuestion(question);
        
        // Obtenir la réponse
        String response = chatbotService.getResponse(cleanQuestion);
        
        return Map.of(
            "success", true,
            "question", question,
            "response", response,
            "botName", "🤖 EventBot"
        );
    }

    /**
     * Endpoint pour obtenir la liste des questions disponibles
     */
    @GetMapping("/help")
    public Map<String, Object> getHelp() {
        return Map.of(
            "success", true,
            "botName", "🤖 EventBot",
            "description", "Je suis ton assistant virtuel. Pose-moi des questions sur l'application !",
            "examples", new String[]{
                "Comment s'inscrire ?",
                "Comment rejoindre une équipe ?",
                "Comment voir le classement ?",
                "Comment contacter le formateur ?",
                "aide"
            }
        );
    }
}
