package org.example.professional_events.service;

import org.example.professional_events.entity.CompetitionStream;
import org.example.professional_events.repository.CompetitionStreamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class StreamService {

    @Autowired
    private CompetitionStreamRepository streamRepository;

    @Autowired
    private org.example.professional_events.repository.ParticipantRepository participantRepository;

    /**
     * Vérifier si un utilisateur est participant d'une compétition
     */
    public boolean isParticipant(Long userId, Long competitionId) {
        return participantRepository.findByUserIdAndCompetitionId(userId, competitionId).isPresent();
    }

    /**
     * Créer ou mettre à jour un stream pour une compétition
     */
    public CompetitionStream createOrUpdateStream(Long competitionId, String streamUrl,
                                                   String title, Integer autoExpireHours, Long userId) {
        CompetitionStream stream = streamRepository.findByCompetitionId(competitionId)
                .orElse(new CompetitionStream());

        stream.setCompetitionId(competitionId);
        stream.setStreamUrl(streamUrl);
        stream.setTitle(title != null ? title : "Live Stream");
        stream.setPlatform(detectPlatform(streamUrl));
        stream.setStatus(CompetitionStream.StreamStatus.OFFLINE);
        stream.setCreatedBy(userId);
        stream.setAutoExpireHours(autoExpireHours);

        return streamRepository.save(stream);
    }

    /**
     * Démarrer le stream (OFFLINE → LIVE)
     */
    public CompetitionStream startStream(Long competitionId) {
        CompetitionStream stream = streamRepository.findByCompetitionId(competitionId)
                .orElseThrow(() -> new RuntimeException("Stream not found"));

        stream.setStatus(CompetitionStream.StreamStatus.LIVE);
        stream.setStartedAt(LocalDateTime.now());
        stream.setStoppedAt(null);

        return streamRepository.save(stream);
    }

    /**
     * Arrêter le stream (LIVE → OFFLINE)
     */
    public CompetitionStream stopStream(Long competitionId) {
        CompetitionStream stream = streamRepository.findByCompetitionId(competitionId)
                .orElseThrow(() -> new RuntimeException("Stream not found"));

        stream.setStatus(CompetitionStream.StreamStatus.OFFLINE);
        stream.setStoppedAt(LocalDateTime.now());

        return streamRepository.save(stream);
    }

    /**
     * Récupérer le stream d'une compétition
     */
    public Optional<CompetitionStream> getStream(Long competitionId) {
        return streamRepository.findByCompetitionId(competitionId);
    }

    /**
     * Supprimer le stream
     */
    public void deleteStream(Long competitionId) {
        streamRepository.findByCompetitionId(competitionId)
                .ifPresent(streamRepository::delete);
    }

    /**
     * Expiration automatique - vérifie toutes les 30 minutes
     */
    @Scheduled(fixedRate = 1800000)
    public void autoExpireStreams() {
        // Chercher les streams expirés (startedAt + autoExpireHours < maintenant)
        List<CompetitionStream> allLive = streamRepository.findAll().stream()
                .filter(s -> s.getStatus() == CompetitionStream.StreamStatus.LIVE
                        && s.getAutoExpireHours() != null
                        && s.getStartedAt() != null)
                .filter(s -> s.getStartedAt().plusHours(s.getAutoExpireHours())
                        .isBefore(LocalDateTime.now()))
                .toList();

        for (CompetitionStream stream : allLive) {
            stream.setStatus(CompetitionStream.StreamStatus.OFFLINE);
            stream.setStoppedAt(LocalDateTime.now());
            streamRepository.save(stream);
            System.out.println("⏰ Stream auto-expiré pour compétition: " + stream.getCompetitionId());
        }
    }

    /**
     * Détecter la plateforme depuis l'URL
     */
    private String detectPlatform(String url) {
        if (url == null) return "OTHER";
        url = url.toLowerCase();
        if (url.contains("youtube.com") || url.contains("youtu.be")) return "YOUTUBE";
        if (url.contains("twitch.tv")) return "TWITCH";
        if (url.contains("zoom.us")) return "ZOOM";
        if (url.contains("meet.google.com")) return "MEET";
        if (url.contains("discord.gg") || url.contains("discord.com")) return "DISCORD";
        return "OTHER";
    }

    /**
     * Générer l'URL embed depuis l'URL originale
     */
    public String getEmbedUrl(String streamUrl) {
        if (streamUrl == null) return null;

        // YouTube: https://www.youtube.com/watch?v=ID → https://www.youtube.com/embed/ID
        if (streamUrl.contains("youtube.com/watch?v=")) {
            String videoId = streamUrl.split("v=")[1].split("&")[0];
            return "https://www.youtube.com/embed/" + videoId + "?autoplay=1";
        }
        // YouTube live: https://www.youtube.com/live/ID
        if (streamUrl.contains("youtube.com/live/")) {
            String videoId = streamUrl.split("live/")[1].split("\\?")[0];
            return "https://www.youtube.com/embed/" + videoId + "?autoplay=1";
        }
        // YouTube short: https://youtu.be/ID
        if (streamUrl.contains("youtu.be/")) {
            String videoId = streamUrl.split("youtu.be/")[1].split("\\?")[0];
            return "https://www.youtube.com/embed/" + videoId + "?autoplay=1";
        }
        // Twitch: https://www.twitch.tv/channel → embed
        if (streamUrl.contains("twitch.tv/")) {
            String channel = streamUrl.split("twitch.tv/")[1].split("\\?")[0];
            return "https://player.twitch.tv/?channel=" + channel + "&parent=localhost";
        }

        return streamUrl; // Zoom/Meet: ouvrir dans nouvel onglet
    }
}
