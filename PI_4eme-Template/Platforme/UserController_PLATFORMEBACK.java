package com.example.platformeback.controller;

import com.example.platformeback.entity.User;
import com.example.platformeback.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * ⭐ NOUVEAU ENDPOINT à ajouter dans PlatformeBack
 * 
 * Ce endpoint permet à Professional Events de vérifier le rôle d'un utilisateur
 * avant de l'autoriser à s'inscrire à une compétition
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    /**
     * Récupérer le rôle d'un utilisateur par son ID
     * 
     * Utilisé par Professional Events pour vérifier si l'utilisateur
     * est un APPRENANT (autorisé) ou un FORMATEUR (bloqué)
     */
    @GetMapping("/{userId}/role")
    public ResponseEntity<String> getUserRole(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        
        // Retourner uniquement le rôle (APPRENANT ou FORMATEUR)
        return ResponseEntity.ok(user.getRole());
    }

    /**
     * Récupérer les informations complètes d'un utilisateur
     * (optionnel - si vous avez besoin de plus d'infos)
     */
    @GetMapping("/{userId}")
    public ResponseEntity<User> getUserById(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        
        return ResponseEntity.ok(user);
    }
}
