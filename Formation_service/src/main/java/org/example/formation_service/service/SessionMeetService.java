package org.example.formation_service.service;

import lombok.RequiredArgsConstructor;
import org.example.formation_service.domain.entity.MeetJoin;
import org.example.formation_service.domain.entity.Session;
import org.example.formation_service.domain.entity.SessionMeet;
import org.example.formation_service.repository.EnrollmentRepository;
import org.example.formation_service.repository.MeetJoinRepository;
import org.example.formation_service.repository.SessionMeetRepository;
import org.example.formation_service.repository.SessionRepository;
import org.example.formation_service.web.dto.CalendarEventResponse;
import org.example.formation_service.web.dto.MeetRequest;
import org.example.formation_service.web.dto.MeetResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SessionMeetService {

    private final SessionMeetRepository meetRepository;
    private final MeetJoinRepository meetJoinRepository;
    private final SessionRepository sessionRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final EmailService emailService;

    // ─── FORMATEUR: Create a meet for a session ───────────────────────────────
    @Transactional
    public MeetResponse createMeet(Long sessionId, Long formateurId, MeetRequest request) {
        Session session = sessionRepository.findById(sessionId)
            .orElseThrow(() -> new RuntimeException("Session not found: " + sessionId));

        // Generate clean alphanumeric token only — no special chars that break Jitsi URLs
        String token = UUID.randomUUID().toString().replace("-", "").substring(0, 20);
        String meetLink = "https://meet.jit.si/" + token;

        SessionMeet meet = SessionMeet.builder()
            .session(session)
            .formateurId(formateurId)
            .title(request.getTitle())
            .description(request.getDescription())
            .scheduledAt(LocalDateTime.parse(request.getScheduledAt()))
            .durationMinutes(request.getDurationMinutes() != null ? request.getDurationMinutes() : 60)
            .meetToken(token)
            .meetLink(meetLink)
            .status(SessionMeet.MeetStatus.SCHEDULED)
            .build();

        meet = meetRepository.save(meet);

        // Notify enrolled students by email
        notifyEnrolledStudents(meet, session);

        return MeetResponse.from(meet, 0);
    }

    // ─── Get meets for a session ──────────────────────────────────────────────
    public List<MeetResponse> getMeetsBySession(Long sessionId) {
        return meetRepository.findBySession_IdOrderByScheduledAtAsc(sessionId)
            .stream()
            .map(m -> MeetResponse.from(m, meetJoinRepository.countByMeet_Id(m.getId())))
            .collect(Collectors.toList());
    }

    // ─── FORMATEUR: Update meet status ────────────────────────────────────────
    @Transactional
    public MeetResponse updateStatus(Long meetId, String status) {
        SessionMeet meet = meetRepository.findById(meetId)
            .orElseThrow(() -> new RuntimeException("Meet not found: " + meetId));
        meet.setStatus(SessionMeet.MeetStatus.valueOf(status));
        meet = meetRepository.save(meet);
        return MeetResponse.from(meet, meetJoinRepository.countByMeet_Id(meetId));
    }

    // ─── FORMATEUR: Delete meet ───────────────────────────────────────────────
    @Transactional
    public void deleteMeet(Long meetId) {
        try {
            meetJoinRepository.deleteByMeetIdNative(meetId);
        } catch (Exception e) {
            System.err.println("Warning deleting joins: " + e.getMessage());
        }
        meetRepository.deleteByIdNative(meetId);
    }

    // ─── APPRENANT: Record join ───────────────────────────────────────────────
    @Transactional
    public void recordJoin(Long meetId, Long userId) {
        if (meetJoinRepository.findByMeet_IdAndUserId(meetId, userId).isPresent()) return;

        SessionMeet meet = meetRepository.findById(meetId)
            .orElseThrow(() -> new RuntimeException("Meet not found: " + meetId));

        MeetJoin join = MeetJoin.builder()
            .meet(meet)
            .userId(userId)
            .joinedAt(LocalDateTime.now())
            .build();
        meetJoinRepository.save(join);
    }

    // ─── CALENDAR: Get events for a month ─────────────────────────────────────
    public List<CalendarEventResponse> getCalendarForFormateur(Long formateurId, String month) {
        YearMonth ym = YearMonth.parse(month);
        LocalDateTime start = ym.atDay(1).atStartOfDay();
        LocalDateTime end = ym.atEndOfMonth().atTime(23, 59, 59);

        List<CalendarEventResponse> events = new ArrayList<>();

        // Virtual meets
        meetRepository.findByFormateurIdAndDateRange(formateurId, start, end)
            .forEach(m -> events.add(CalendarEventResponse.builder()
                .id(m.getId())
                .title(m.getTitle())
                .start(m.getScheduledAt())
                .end(m.getScheduledAt().plusMinutes(m.getDurationMinutes()))
                .type("VIRTUAL")
                .color("#3B82F6")
                .meetLink(m.getMeetLink())
                .sessionId(m.getSession().getId())
                .meetId(m.getId())
                .status(m.getStatus().name())
                .build()));

        // In-person sessions
        sessionRepository.findByFormateurIdAndDateRange(formateurId, start, end)
            .forEach(s -> events.add(CalendarEventResponse.builder()
                .id(s.getId())
                .title(s.getCourse() != null ? s.getCourse().getTitle() : "Session")
                .start(s.getStartAt())
                .end(s.getEndAt())
                .type("IN_PERSON")
                .color("#10B981")
                .location(s.getLocation())
                .sessionId(s.getId())
                .status(s.getStatus().name())
                .build()));

        events.sort((a, b) -> a.getStart().compareTo(b.getStart()));
        return events;
    }

    public List<CalendarEventResponse> getCalendarForApprenant(Long userId, String month) {
        YearMonth ym = YearMonth.parse(month);
        LocalDateTime start = ym.atDay(1).atStartOfDay();
        LocalDateTime end = ym.atEndOfMonth().atTime(23, 59, 59);

        List<CalendarEventResponse> events = new ArrayList<>();

        // Virtual meets for enrolled courses
        meetRepository.findForApprenantCalendar(userId, start, end)
            .forEach(m -> events.add(CalendarEventResponse.builder()
                .id(m.getId())
                .title(m.getTitle())
                .start(m.getScheduledAt())
                .end(m.getScheduledAt().plusMinutes(m.getDurationMinutes()))
                .type("VIRTUAL")
                .color("#3B82F6")
                .meetLink(m.getMeetLink())
                .sessionId(m.getSession().getId())
                .meetId(m.getId())
                .status(m.getStatus().name())
                .build()));

        // In-person sessions for enrolled courses
        sessionRepository.findForApprenantCalendar(userId, start, end)
            .forEach(s -> events.add(CalendarEventResponse.builder()
                .id(s.getId())
                .title(s.getCourse() != null ? s.getCourse().getTitle() : "Session")
                .start(s.getStartAt())
                .end(s.getEndAt())
                .type("IN_PERSON")
                .color("#10B981")
                .location(s.getLocation())
                .sessionId(s.getId())
                .status(s.getStatus().name())
                .build()));

        events.sort((a, b) -> a.getStart().compareTo(b.getStart()));
        return events;
    }

    // ─── Sidebar: upcoming meets ──────────────────────────────────────────────
    public List<MeetResponse> getUpcomingMeetsForFormateur(Long formateurId) {
        return meetRepository.findUpcomingMeetsForFormateur(formateurId, LocalDateTime.now())
            .stream().limit(5)
            .map(m -> MeetResponse.from(m, meetJoinRepository.countByMeet_Id(m.getId())))
            .collect(Collectors.toList());
    }

    public List<MeetResponse> getUpcomingMeetsForApprenant(Long userId) {
        return meetRepository.findUpcomingMeetsForApprenant(userId, LocalDateTime.now())
            .stream().limit(5)
            .map(m -> MeetResponse.from(m, meetJoinRepository.countByMeet_Id(m.getId())))
            .collect(Collectors.toList());
    }

    public List<MeetResponse> getTodayMeetsForApprenant(Long userId) {
        return meetRepository.findTodayMeetsForApprenant(userId)
            .stream()
            .map(m -> MeetResponse.from(m, meetJoinRepository.countByMeet_Id(m.getId())))
            .collect(Collectors.toList());
    }

    public List<MeetResponse> getTodayMeetsForFormateur(Long formateurId) {
        return meetRepository.findTodayMeetsForFormateur(formateurId)
            .stream()
            .map(m -> MeetResponse.from(m, meetJoinRepository.countByMeet_Id(m.getId())))
            .collect(Collectors.toList());
    }

    // ─── Email notification ───────────────────────────────────────────────────
    private void notifyEnrolledStudents(SessionMeet meet, Session session) {
        try {
            List<Long> enrolledUserIds = enrollmentRepository
                .findByCourse_IdAndStatus(session.getCourse().getId(), 
                    org.example.formation_service.domain.enums.EnrollmentStatus.ACTIVE)
                .stream()
                .map(e -> e.getUserId())
                .collect(Collectors.toList());

            String subject = "📹 Nouveau meet planifié: " + meet.getTitle();
            String body = buildMeetEmailBody(meet);

            // Send to each enrolled student (email fetched via user service in real scenario)
            // For now we log — wire to emailService when user emails are available
            System.out.println("📧 Would notify " + enrolledUserIds.size() + " students about meet: " + meet.getTitle());
        } catch (Exception e) {
            System.err.println("⚠️ Could not send meet notifications: " + e.getMessage());
        }
    }

    private String buildMeetEmailBody(SessionMeet meet) {
        return "<div style='font-family:sans-serif;max-width:600px;margin:auto'>"
            + "<h2 style='color:#0F9B8E'>📹 Nouveau Meet Planifié</h2>"
            + "<p><strong>" + meet.getTitle() + "</strong></p>"
            + "<p>📅 Date: " + meet.getScheduledAt() + "</p>"
            + "<p>⏱ Durée: " + meet.getDurationMinutes() + " minutes</p>"
            + "<p><a href='" + meet.getMeetLink() + "' style='background:#0F9B8E;color:white;padding:10px 20px;border-radius:6px;text-decoration:none'>Rejoindre le Meet</a></p>"
            + "</div>";
    }
}
