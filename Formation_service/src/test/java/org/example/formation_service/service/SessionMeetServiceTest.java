package org.example.formation_service.service;

import org.example.formation_service.domain.entity.*;
import org.example.formation_service.repository.*;
import org.example.formation_service.web.dto.CalendarEventResponse;
import org.example.formation_service.web.dto.MeetRequest;
import org.example.formation_service.web.dto.MeetResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SessionMeetServiceTest {

    @Mock private SessionMeetRepository meetRepository;
    @Mock private MeetJoinRepository meetJoinRepository;
    @Mock private SessionRepository sessionRepository;
    @Mock private EnrollmentRepository enrollmentRepository;
    @Mock private EmailService emailService;

    @InjectMocks private SessionMeetService sessionMeetService;

    private Session session;
    private Course course;
    private MeetRequest meetRequest;
    private SessionMeet sessionMeet;

    @BeforeEach
    void setUp() {
        course = new Course();
        course.setId(100L);
        course.setTitle("Java Programming");

        session = Session.builder()
            .id(1L)
            .course(course)
            .build();

        meetRequest = new MeetRequest();
        meetRequest.setTitle("Weekly Standup");
        meetRequest.setDescription("Team sync meeting");
        meetRequest.setScheduledAt(LocalDateTime.now().plusDays(1).toString());
        meetRequest.setDurationMinutes(60);

        sessionMeet = SessionMeet.builder()
            .id(1L)
            .session(session)
            .formateurId(10L)
            .title("Weekly Standup")
            .description("Team sync meeting")
            .scheduledAt(LocalDateTime.now().plusDays(1))
            .durationMinutes(60)
            .meetToken("abc123token")
            .meetLink("https://meet.jit.si/abc123token")
            .status(SessionMeet.MeetStatus.SCHEDULED)
            .build();
    }

    // ── createMeet ────────────────────────────────────────────────────────────

    @Test
    void createMeet_shouldThrow_whenSessionNotFound() {
        when(sessionRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sessionMeetService.createMeet(999L, 10L, meetRequest))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("Session not found");
    }

    @Test
    void createMeet_shouldCreateMeetWithGeneratedToken() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(meetRepository.save(any(SessionMeet.class))).thenAnswer(i -> {
            SessionMeet meet = i.getArgument(0);
            meet.setId(1L);
            return meet;
        });
        when(enrollmentRepository.findByCourse_IdAndStatus(anyLong(), any()))
            .thenReturn(Arrays.asList());

        MeetResponse result = sessionMeetService.createMeet(1L, 10L, meetRequest);

        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("Weekly Standup");
        assertThat(result.getMeetLink()).startsWith("https://meet.jit.si/");
        assertThat(result.getMeetToken()).isNotEmpty();
        assertThat(result.getMeetToken()).hasSize(20); // Token length
        assertThat(result.getStatus()).isEqualTo("SCHEDULED");
        verify(meetRepository).save(any(SessionMeet.class));
    }

    @Test
    void createMeet_shouldUseDefaultDuration_whenNotProvided() {
        meetRequest.setDurationMinutes(null);
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(meetRepository.save(any(SessionMeet.class))).thenAnswer(i -> {
            SessionMeet meet = i.getArgument(0);
            meet.setId(1L);
            return meet;
        });
        when(enrollmentRepository.findByCourse_IdAndStatus(anyLong(), any()))
            .thenReturn(Arrays.asList());

        MeetResponse result = sessionMeetService.createMeet(1L, 10L, meetRequest);

        assertThat(result.getDurationMinutes()).isEqualTo(60); // Default
    }

    // ── getMeetsBySession ─────────────────────────────────────────────────────

    @Test
    void getMeetsBySession_shouldReturnMeetsOrderedByScheduledAt() {
        SessionMeet meet1 = SessionMeet.builder()
            .id(1L).title("Meet 1")
            .scheduledAt(LocalDateTime.now().plusDays(2))
            .session(session)
            .build();
        
        SessionMeet meet2 = SessionMeet.builder()
            .id(2L).title("Meet 2")
            .scheduledAt(LocalDateTime.now().plusDays(1))
            .session(session)
            .build();

        when(meetRepository.findBySession_IdOrderByScheduledAtAsc(1L))
            .thenReturn(Arrays.asList(meet2, meet1)); // Already ordered
        when(meetJoinRepository.countByMeet_Id(anyLong())).thenReturn(5L);

        List<MeetResponse> results = sessionMeetService.getMeetsBySession(1L);

        assertThat(results).hasSize(2);
        assertThat(results.get(0).getTitle()).isEqualTo("Meet 2"); // Earlier date first
        assertThat(results.get(1).getTitle()).isEqualTo("Meet 1");
        assertThat(results.get(0).getParticipantCount()).isEqualTo(5);
    }

    // ── updateStatus ──────────────────────────────────────────────────────────

    @Test
    void updateStatus_shouldThrow_whenMeetNotFound() {
        when(meetRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sessionMeetService.updateStatus(999L, "COMPLETED"))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("Meet not found");
    }

    @Test
    void updateStatus_shouldUpdateMeetStatus() {
        when(meetRepository.findById(1L)).thenReturn(Optional.of(sessionMeet));
        when(meetRepository.save(any(SessionMeet.class))).thenAnswer(i -> i.getArgument(0));
        when(meetJoinRepository.countByMeet_Id(1L)).thenReturn(10L);

        MeetResponse result = sessionMeetService.updateStatus(1L, "ENDED");

        assertThat(result.getStatus()).isEqualTo("ENDED");
        verify(meetRepository).save(sessionMeet);
    }

    // ── deleteMeet ────────────────────────────────────────────────────────────

    @Test
    void deleteMeet_shouldDeleteMeetAndJoins() {
        doNothing().when(meetJoinRepository).deleteByMeetIdNative(1L);
        doNothing().when(meetRepository).deleteByIdNative(1L);

        assertThatCode(() -> sessionMeetService.deleteMeet(1L))
            .doesNotThrowAnyException();

        verify(meetJoinRepository).deleteByMeetIdNative(1L);
        verify(meetRepository).deleteByIdNative(1L);
    }

    @Test
    void deleteMeet_shouldContinue_whenJoinDeletionFails() {
        doThrow(new RuntimeException("Join deletion failed"))
            .when(meetJoinRepository).deleteByMeetIdNative(1L);
        doNothing().when(meetRepository).deleteByIdNative(1L);

        assertThatCode(() -> sessionMeetService.deleteMeet(1L))
            .doesNotThrowAnyException();

        verify(meetRepository).deleteByIdNative(1L); // Still deletes meet
    }

    // ── recordJoin ────────────────────────────────────────────────────────────

    @Test
    void recordJoin_shouldThrow_whenMeetNotFound() {
        when(meetJoinRepository.findByMeet_IdAndUserId(999L, 1L))
            .thenReturn(Optional.empty());
        when(meetRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sessionMeetService.recordJoin(999L, 1L))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("Meet not found");
    }

    @Test
    void recordJoin_shouldCreateJoinRecord_whenNotExists() {
        when(meetJoinRepository.findByMeet_IdAndUserId(1L, 1L))
            .thenReturn(Optional.empty());
        when(meetRepository.findById(1L)).thenReturn(Optional.of(sessionMeet));
        when(meetJoinRepository.save(any(MeetJoin.class))).thenAnswer(i -> i.getArgument(0));

        assertThatCode(() -> sessionMeetService.recordJoin(1L, 1L))
            .doesNotThrowAnyException();

        verify(meetJoinRepository).save(any(MeetJoin.class));
    }

    @Test
    void recordJoin_shouldNotCreateDuplicate_whenAlreadyJoined() {
        MeetJoin existingJoin = new MeetJoin();
        when(meetJoinRepository.findByMeet_IdAndUserId(1L, 1L))
            .thenReturn(Optional.of(existingJoin));

        assertThatCode(() -> sessionMeetService.recordJoin(1L, 1L))
            .doesNotThrowAnyException();

        verify(meetJoinRepository, never()).save(any());
    }

    // ── getCalendarForFormateur ───────────────────────────────────────────────

    @Test
    void getCalendarForFormateur_shouldReturnVirtualAndInPersonEvents() {
        LocalDateTime now = LocalDateTime.now();
        String month = now.getYear() + "-" + String.format("%02d", now.getMonthValue());

        SessionMeet virtualMeet = SessionMeet.builder()
            .id(1L)
            .title("Virtual Meet")
            .scheduledAt(now.plusDays(5))
            .durationMinutes(60)
            .meetLink("https://meet.jit.si/token")
            .status(SessionMeet.MeetStatus.SCHEDULED)
            .session(session)
            .build();

        Session inPersonSession = Session.builder()
            .id(2L)
            .course(course)
            .startAt(now.plusDays(3))
            .endAt(now.plusDays(3).plusHours(2))
            .location("Room 101")
            .build();

        when(meetRepository.findByFormateurIdAndDateRange(eq(10L), any(), any()))
            .thenReturn(Arrays.asList(virtualMeet));
        when(sessionRepository.findByFormateurIdAndDateRange(eq(10L), any(), any()))
            .thenReturn(Arrays.asList(inPersonSession));

        List<CalendarEventResponse> events = sessionMeetService.getCalendarForFormateur(10L, month);

        assertThat(events).hasSize(2);
        assertThat(events.stream().filter(e -> e.getType().equals("VIRTUAL")).count()).isEqualTo(1);
        assertThat(events.stream().filter(e -> e.getType().equals("IN_PERSON")).count()).isEqualTo(1);
    }

    // ── getUpcomingMeetsForFormateur ──────────────────────────────────────────

    @Test
    void getUpcomingMeetsForFormateur_shouldReturnUpcomingMeetsOnly() {
        SessionMeet upcomingMeet = SessionMeet.builder()
            .id(1L)
            .title("Upcoming Meet")
            .scheduledAt(LocalDateTime.now().plusDays(1))
            .session(session)
            .build();

        when(meetRepository.findUpcomingMeetsForFormateur(eq(10L), any()))
            .thenReturn(Arrays.asList(upcomingMeet));
        when(meetJoinRepository.countByMeet_Id(1L)).thenReturn(3L);

        List<MeetResponse> results = sessionMeetService.getUpcomingMeetsForFormateur(10L);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getTitle()).isEqualTo("Upcoming Meet");
        assertThat(results.get(0).getParticipantCount()).isEqualTo(3);
    }

    @Test
    void getUpcomingMeetsForFormateur_shouldLimitToFive() {
        List<SessionMeet> sixMeets = Arrays.asList(
            createMeet(1L), createMeet(2L), createMeet(3L),
            createMeet(4L), createMeet(5L), createMeet(6L)
        );

        when(meetRepository.findUpcomingMeetsForFormateur(eq(10L), any()))
            .thenReturn(sixMeets);
        when(meetJoinRepository.countByMeet_Id(anyLong())).thenReturn(0L);

        List<MeetResponse> results = sessionMeetService.getUpcomingMeetsForFormateur(10L);

        assertThat(results).hasSize(5); // Limited to 5
    }

    // ── getTodayMeetsForApprenant ─────────────────────────────────────────────

    @Test
    void getTodayMeetsForApprenant_shouldReturnTodayMeetsOnly() {
        SessionMeet todayMeet = SessionMeet.builder()
            .id(1L)
            .title("Today's Meet")
            .scheduledAt(LocalDateTime.now().withHour(14))
            .session(session)
            .build();

        when(meetRepository.findTodayMeetsForApprenant(1L))
            .thenReturn(Arrays.asList(todayMeet));
        when(meetJoinRepository.countByMeet_Id(1L)).thenReturn(8L);

        List<MeetResponse> results = sessionMeetService.getTodayMeetsForApprenant(1L);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getTitle()).isEqualTo("Today's Meet");
        assertThat(results.get(0).getParticipantCount()).isEqualTo(8);
    }

    // ── Helper Methods ────────────────────────────────────────────────────────

    private SessionMeet createMeet(Long id) {
        return SessionMeet.builder()
            .id(id)
            .title("Meet " + id)
            .scheduledAt(LocalDateTime.now().plusDays(id))
            .session(session)
            .build();
    }
}
