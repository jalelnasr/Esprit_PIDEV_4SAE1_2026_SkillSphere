package org.example.professional_events.service;

import org.example.professional_events.entity.CompetitionStream;
import org.example.professional_events.entity.Participant;
import org.example.professional_events.repository.CompetitionStreamRepository;
import org.example.professional_events.repository.ParticipantRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StreamServiceTest {

    @Mock
    private CompetitionStreamRepository streamRepository;

    @Mock
    private ParticipantRepository participantRepository;

    @InjectMocks
    private StreamService streamService;

    private CompetitionStream stream;

    @BeforeEach
    void setUp() {
        stream = new CompetitionStream();
        stream.setId(1L);
        stream.setCompetitionId(39L);
        stream.setStreamUrl("https://www.youtube.com/watch?v=abc123");
        stream.setTitle("Live Hackathon");
        stream.setStatus(CompetitionStream.StreamStatus.OFFLINE);
        stream.setCreatedBy(8L);
    }

    // ===== Tests logique métier: détection de plateforme =====

    @Test
    void createStream_withYoutubeUrl_shouldDetectYoutubePlatform() {
        when(streamRepository.findByCompetitionId(39L)).thenReturn(Optional.empty());
        when(streamRepository.save(any())).thenAnswer(inv -> {
            CompetitionStream s = inv.getArgument(0);
            assertEquals("YOUTUBE", s.getPlatform());
            return s;
        });

        streamService.createOrUpdateStream(39L, "https://www.youtube.com/watch?v=abc123", "Test", 2, 8L);
        verify(streamRepository).save(any());
    }

    @Test
    void createStream_withTwitchUrl_shouldDetectTwitchPlatform() {
        when(streamRepository.findByCompetitionId(39L)).thenReturn(Optional.empty());
        when(streamRepository.save(any())).thenAnswer(inv -> {
            CompetitionStream s = inv.getArgument(0);
            assertEquals("TWITCH", s.getPlatform());
            return s;
        });

        streamService.createOrUpdateStream(39L, "https://www.twitch.tv/mychannel", "Test", 2, 8L);
        verify(streamRepository).save(any());
    }

    @Test
    void createStream_withZoomUrl_shouldDetectZoomPlatform() {
        when(streamRepository.findByCompetitionId(39L)).thenReturn(Optional.empty());
        when(streamRepository.save(any())).thenAnswer(inv -> {
            CompetitionStream s = inv.getArgument(0);
            assertEquals("ZOOM", s.getPlatform());
            return s;
        });

        streamService.createOrUpdateStream(39L, "https://zoom.us/j/123456", "Test", 2, 8L);
        verify(streamRepository).save(any());
    }

    // ===== Tests logique métier: transitions de statut =====

    @Test
    void startStream_shouldChangeStatusToLive() {
        when(streamRepository.findByCompetitionId(39L)).thenReturn(Optional.of(stream));
        when(streamRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        CompetitionStream result = streamService.startStream(39L);

        assertEquals(CompetitionStream.StreamStatus.LIVE, result.getStatus());
        assertNotNull(result.getStartedAt());
        assertNull(result.getStoppedAt());
    }

    @Test
    void stopStream_shouldChangeStatusToOffline() {
        stream.setStatus(CompetitionStream.StreamStatus.LIVE);
        stream.setStartedAt(LocalDateTime.now().minusHours(1));

        when(streamRepository.findByCompetitionId(39L)).thenReturn(Optional.of(stream));
        when(streamRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        CompetitionStream result = streamService.stopStream(39L);

        assertEquals(CompetitionStream.StreamStatus.OFFLINE, result.getStatus());
        assertNotNull(result.getStoppedAt());
    }

    @Test
    void startStream_whenNotFound_shouldThrowException() {
        when(streamRepository.findByCompetitionId(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> streamService.startStream(99L));
    }

    // ===== Tests logique métier: expiration automatique =====

    @Test
    void autoExpireStreams_shouldExpireOldLiveStreams() {
        CompetitionStream expiredStream = new CompetitionStream();
        expiredStream.setStatus(CompetitionStream.StreamStatus.LIVE);
        expiredStream.setStartedAt(LocalDateTime.now().minusHours(5));
        expiredStream.setAutoExpireHours(2); // expiré depuis 3h

        when(streamRepository.findAll()).thenReturn(List.of(expiredStream));

        streamService.autoExpireStreams();

        assertEquals(CompetitionStream.StreamStatus.OFFLINE, expiredStream.getStatus());
        verify(streamRepository).save(expiredStream);
    }

    @Test
    void autoExpireStreams_shouldNotExpireRecentStreams() {
        CompetitionStream recentStream = new CompetitionStream();
        recentStream.setStatus(CompetitionStream.StreamStatus.LIVE);
        recentStream.setStartedAt(LocalDateTime.now().minusMinutes(30));
        recentStream.setAutoExpireHours(2); // pas encore expiré

        when(streamRepository.findAll()).thenReturn(List.of(recentStream));

        streamService.autoExpireStreams();

        assertEquals(CompetitionStream.StreamStatus.LIVE, recentStream.getStatus());
        verify(streamRepository, never()).save(recentStream);
    }

    // ===== Tests logique métier: URL embed =====

    @Test
    void getEmbedUrl_forYoutubeWatch_shouldReturnEmbedUrl() {
        String result = streamService.getEmbedUrl("https://www.youtube.com/watch?v=abc123");
        assertEquals("https://www.youtube.com/embed/abc123?autoplay=1", result);
    }

    @Test
    void getEmbedUrl_forYoutubeShort_shouldReturnEmbedUrl() {
        String result = streamService.getEmbedUrl("https://youtu.be/abc123");
        assertEquals("https://www.youtube.com/embed/abc123?autoplay=1", result);
    }

    @Test
    void getEmbedUrl_forTwitch_shouldReturnPlayerUrl() {
        String result = streamService.getEmbedUrl("https://www.twitch.tv/mychannel");
        assertTrue(result.contains("player.twitch.tv"));
        assertTrue(result.contains("mychannel"));
    }

    @Test
    void getEmbedUrl_forNull_shouldReturnNull() {
        assertNull(streamService.getEmbedUrl(null));
    }

    // ===== Tests contrôle d'accès =====

    @Test
    void isParticipant_whenRegistered_shouldReturnTrue() {
        when(participantRepository.findByUserIdAndCompetitionId(11L, 39L))
                .thenReturn(Optional.of(new Participant()));

        assertTrue(streamService.isParticipant(11L, 39L));
    }

    @Test
    void isParticipant_whenNotRegistered_shouldReturnFalse() {
        when(participantRepository.findByUserIdAndCompetitionId(99L, 39L))
                .thenReturn(Optional.empty());

        assertFalse(streamService.isParticipant(99L, 39L));
    }
}
