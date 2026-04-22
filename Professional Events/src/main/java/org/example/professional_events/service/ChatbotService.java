package org.example.professional_events.service;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class ChatbotService {

    private final Map<String, String> responses = new HashMap<>();

    public ChatbotService() {
        initializeResponses();
    }

    private void initializeResponses() {
        // Questions sur l'application
        responses.put("comment utiliser l'application", 
            "📱 Pour utiliser l'application:\n" +
            "1. Connecte-toi avec ton email et mot de passe\n" +
            "2. Va dans 'Compétitions' pour voir les compétitions disponibles\n" +
            "3. Clique sur une compétition pour voir les détails\n" +
            "4. Inscris-toi en cliquant sur 'Participer'\n\n" +
            "Besoin d'aide? Tape 'aide'");

        responses.put("comment s'inscrire", 
            "✅ Pour t'inscrire à une compétition:\n" +
            "1. Va dans la liste des compétitions\n" +
            "2. Choisis une compétition OUVERTE\n" +
            "3. Clique sur 'Participer'\n" +
            "4. Confirme ton inscription\n\n" +
            "Tu recevras une confirmation par email!");

        responses.put("comment rejoindre une équipe", 
            "👥 Pour rejoindre une équipe:\n" +
            "1. Va dans l'onglet 'Équipes' de la compétition\n" +
            "2. Clique sur 'Rejoindre une équipe'\n" +
            "3. Sélectionne une équipe disponible\n" +
            "4. Attends la validation du formateur\n\n" +
            "Note: Certaines compétitions sont individuelles!");

        responses.put("comment créer une équipe", 
            "🏆 Pour créer une équipe:\n" +
            "1. Va dans l'onglet 'Équipes'\n" +
            "2. Clique sur 'Créer une équipe'\n" +
            "3. Donne un nom à ton équipe\n" +
            "4. Invite des membres\n\n" +
            "Tu seras le capitaine de l'équipe!");

        responses.put("comment voir le classement", 
            "📊 Pour voir le classement:\n" +
            "1. Va dans la compétition\n" +
            "2. Clique sur l'onglet 'Classement'\n" +
            "3. Tu verras le classement en temps réel\n\n" +
            "Le classement est mis à jour automatiquement!");

        responses.put("comment envoyer un message", 
            "💬 Pour envoyer un message:\n" +
            "1. Va dans l'onglet 'Chat'\n" +
            "2. Choisis le type de message:\n" +
            "   • Chat Général (tout le monde)\n" +
            "   • Mon Équipe (seulement ton équipe)\n" +
            "   • Privé (seulement le formateur)\n" +
            "3. Tape ton message et envoie!\n\n" +
            "Les messages sont instantanés!");

        responses.put("comment contacter le formateur", 
            "👨‍🏫 Pour contacter le formateur:\n" +
            "1. Va dans le chat de la compétition\n" +
            "2. Sélectionne 'Privé (Formateur)'\n" +
            "3. Envoie ton message\n\n" +
            "Le formateur recevra ton message en privé!");

        responses.put("quand commence la compétition", 
            "📅 Pour voir quand commence la compétition:\n" +
            "1. Va dans les détails de la compétition\n" +
            "2. Regarde la section 'Dates'\n" +
            "3. Tu verras la date et l'heure de début\n\n" +
            "Tu recevras un rappel avant le début!");

        responses.put("comment soumettre mon projet", 
            "📤 Pour soumettre ton projet:\n" +
            "1. Va dans 'Mon Projet'\n" +
            "2. Clique sur 'Soumettre'\n" +
            "3. Upload ton fichier (max 50 MB)\n" +
            "4. Confirme la soumission\n\n" +
            "Formats acceptés: .zip, .rar, .tar.gz");

        responses.put("comment voir mes participations", 
            "📋 Pour voir tes participations:\n" +
            "1. Va dans le menu principal\n" +
            "2. Clique sur 'Mes Participations'\n" +
            "3. Tu verras toutes tes compétitions\n\n" +
            "Tu peux filtrer par statut!");

        // Questions générales
        responses.put("aide", 
            "🤖 Je suis le Bot Assistant!\n\n" +
            "Je peux t'aider avec:\n" +
            "• Comment utiliser l'application\n" +
            "• Comment s'inscrire à une compétition\n" +
            "• Comment rejoindre/créer une équipe\n" +
            "• Comment voir le classement\n" +
            "• Comment envoyer des messages\n" +
            "• Comment contacter le formateur\n\n" +
            "Pose-moi une question!");

        responses.put("bonjour", 
            "👋 Bonjour! Je suis le Bot Assistant.\n" +
            "Comment puis-je t'aider aujourd'hui?\n\n" +
            "Tape 'aide' pour voir ce que je peux faire!");

        responses.put("merci", 
            "😊 De rien! Je suis là pour t'aider.\n" +
            "N'hésite pas si tu as d'autres questions!");

        responses.put("au revoir", 
            "👋 Au revoir! Bonne chance dans tes compétitions! 🚀");
    }

    /**
     * Analyse la question et retourne une réponse
     */
    public String getResponse(String question) {
        if (question == null || question.trim().isEmpty()) {
            return null;
        }

        String normalizedQuestion = question.toLowerCase().trim();

        // Recherche exacte
        if (responses.containsKey(normalizedQuestion)) {
            return responses.get(normalizedQuestion);
        }

        // Recherche par mots-clés
        for (Map.Entry<String, String> entry : responses.entrySet()) {
            if (containsKeywords(normalizedQuestion, entry.getKey())) {
                return entry.getValue();
            }
        }

        // Réponse par défaut
        return "🤔 Je n'ai pas compris ta question.\n\n" +
               "Essaie de reformuler ou tape 'aide' pour voir ce que je peux faire!\n\n" +
               "Questions fréquentes:\n" +
               "• Comment s'inscrire?\n" +
               "• Comment rejoindre une équipe?\n" +
               "• Comment voir le classement?\n" +
               "• Comment contacter le formateur?";
    }

    /**
     * Vérifie si la question contient les mots-clés de la réponse
     */
    private boolean containsKeywords(String question, String keywords) {
        String[] keywordArray = keywords.split(" ");
        int matchCount = 0;

        for (String keyword : keywordArray) {
            if (question.contains(keyword)) {
                matchCount++;
            }
        }

        // Si au moins 60% des mots-clés correspondent
        return matchCount >= (keywordArray.length * 0.6);
    }

    /**
     * Vérifie si un message est une question pour le bot
     */
    public boolean isBotQuestion(String message) {
        if (message == null || message.trim().isEmpty()) {
            return false;
        }

        String normalized = message.toLowerCase().trim();

        // Commence par @bot ou bot:
        if (normalized.startsWith("@bot") || normalized.startsWith("bot:")) {
            return true;
        }

        // Contient des mots-clés de question
        String[] questionKeywords = {
            "comment", "pourquoi", "quand", "où", "qui", "quoi",
            "aide", "help", "?", "peux-tu", "pourrais-tu"
        };

        for (String keyword : questionKeywords) {
            if (normalized.contains(keyword)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Nettoie le message pour extraire la question
     */
    public String extractQuestion(String message) {
        if (message == null) {
            return "";
        }

        String cleaned = message.trim();

        // Retire @bot ou bot: du début
        if (cleaned.toLowerCase().startsWith("@bot")) {
            cleaned = cleaned.substring(4).trim();
        } else if (cleaned.toLowerCase().startsWith("bot:")) {
            cleaned = cleaned.substring(4).trim();
        }

        return cleaned;
    }
}
