package org.example.formation_service.util;

import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;

public class ContentModerationUtil {
    
    // Liste des mots inappropriés en anglais (version basique)
    private static final List<String> INAPPROPRIATE_WORDS = Arrays.asList(
        "fuck", "shit", "bitch", "asshole", "bastard", "damn", "hell",
        "crap", "piss", "dick", "cock", "pussy", "whore", "slut",
        "nigger", "fag", "retard", "idiot", "stupid", "dumb",
        "kill", "die", "hate", "suck", "ass", "sex"
    );
    
    /**
     * Vérifie si le texte contient des mots inappropriés
     * @param text Le texte à vérifier
     * @return true si le texte contient des mots inappropriés
     */
    public static boolean containsInappropriateContent(String text) {
        if (text == null || text.trim().isEmpty()) {
            return false;
        }
        
        String lowerText = text.toLowerCase();
        
        // Vérifier chaque mot inapproprié
        for (String word : INAPPROPRIATE_WORDS) {
            // Utiliser des regex pour détecter le mot même avec des variations
            String pattern = "\\b" + Pattern.quote(word) + "\\b";
            if (Pattern.compile(pattern, Pattern.CASE_INSENSITIVE).matcher(lowerText).find()) {
                return true;
            }
            
            // Détecter aussi les variations avec des caractères spéciaux (f*ck, sh!t, etc.)
            String obfuscatedPattern = word.chars()
                .mapToObj(c -> "[" + (char)c + "*!@#$%]")
                .reduce("", (a, b) -> a + b);
            if (Pattern.compile(obfuscatedPattern, Pattern.CASE_INSENSITIVE).matcher(lowerText).find()) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Nettoie le texte en remplaçant les mots inappropriés par des astérisques
     * @param text Le texte à nettoyer
     * @return Le texte nettoyé
     */
    public static String cleanText(String text) {
        if (text == null || text.trim().isEmpty()) {
            return text;
        }
        
        String cleanedText = text;
        
        for (String word : INAPPROPRIATE_WORDS) {
            String pattern = "\\b" + Pattern.quote(word) + "\\b";
            String replacement = "*".repeat(word.length());
            cleanedText = Pattern.compile(pattern, Pattern.CASE_INSENSITIVE)
                .matcher(cleanedText)
                .replaceAll(replacement);
        }
        
        return cleanedText;
    }
    
    /**
     * Valide le texte et lance une exception si inapproprié
     * @param text Le texte à valider
     * @throws IllegalArgumentException si le texte contient des mots inappropriés
     */
    public static void validateContent(String text) {
        if (containsInappropriateContent(text)) {
            throw new IllegalArgumentException(
                "Le commentaire contient des mots inappropriés. Veuillez utiliser un langage respectueux."
            );
        }
    }
}
