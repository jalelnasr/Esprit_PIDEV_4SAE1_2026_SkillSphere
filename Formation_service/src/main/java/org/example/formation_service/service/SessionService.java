package org.example.formation_service.service;

import lombok.RequiredArgsConstructor;
import org.example.formation_service.domain.entity.Course;
import org.example.formation_service.domain.entity.Session;
import org.example.formation_service.domain.entity.SessionEnrollment;
import org.example.formation_service.domain.enums.CourseStatus;
import org.example.formation_service.domain.enums.EnrollmentStatus;
import org.example.formation_service.domain.enums.SessionStatus;
import org.example.formation_service.exception.BusinessException;
import org.example.formation_service.repository.SessionRepository;
import org.example.formation_service.repository.SessionEnrollmentRepository;
import org.example.formation_service.web.dto.SessionRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SessionService {
    
    private final SessionRepository sessionRepository;
    private final SessionEnrollmentRepository sessionEnrollmentRepository;
    private final CourseService courseService;
    private final EnrollmentService enrollmentService;
    
    @Transactional
    public Session createSession(Long courseId, SessionRequest request) {
        Course course = courseService.getCourseById(courseId);
        
        Session session = Session.builder()
            .course(course)
            .startAt(request.getStartAt())
            .endAt(request.getEndAt())
            .timezone(request.getTimezone())
            .location(request.getLocation())
            .capacity(request.getCapacity())
            .status(SessionStatus.PLANNED)
            .enrolledCount(0)
            .build();
        
        return sessionRepository.save(session);
    }
    
    @Transactional
    public Session updateSession(Long sessionId, SessionRequest request) {
        Session session = sessionRepository.findById(sessionId)
            .orElseThrow(() -> new BusinessException("SESSION_NOT_FOUND", "Session not found"));
        
        // Update session fields
        session.setStartAt(request.getStartAt());
        session.setEndAt(request.getEndAt());
        session.setTimezone(request.getTimezone());
        session.setLocation(request.getLocation());
        session.setCapacity(request.getCapacity());
        
        return sessionRepository.save(session);
    }
    
    public java.util.List<Session> getSessionsByCourseId(Long courseId) {
        return sessionRepository.findByCourseId(courseId);
    }
    
    public java.util.List<Session> getAllSessions() {
        return sessionRepository.findAll(
            org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "startAt")
        );
    }
    
    public java.util.List<Session> getRecentSessions(int limit) {
        return sessionRepository.findAll(
            org.springframework.data.domain.PageRequest.of(0, limit, 
                org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "startAt"))
        ).getContent();
    }
    
    @Transactional
    public Session openSession(Long sessionId) {
        Session session = sessionRepository.findById(sessionId)
            .orElseThrow(() -> new BusinessException("SESSION_NOT_FOUND", "Session not found"));
        
        if (session.getCourse().getStatus() != CourseStatus.PUBLISHED) {
            throw new BusinessException("COURSE_NOT_PUBLISHED", "Cannot open session for unpublished course");
        }
        
        session.setStatus(SessionStatus.OPEN);
        return sessionRepository.save(session);
    }
    
    @Transactional
    public Session closeSession(Long sessionId) {
        Session session = sessionRepository.findById(sessionId)
            .orElseThrow(() -> new BusinessException("SESSION_NOT_FOUND", "Session not found"));
        
        session.setStatus(SessionStatus.CLOSED);
        return sessionRepository.save(session);
    }
    
    @Transactional
    public void enrollInSession(Long sessionId, Long userId) {
        Session session = sessionRepository.findById(sessionId)
            .orElseThrow(() -> new BusinessException("SESSION_NOT_FOUND", "Session not found"));
        
        if (session.getStatus() != SessionStatus.OPEN) {
            throw new BusinessException("SESSION_NOT_OPEN", "Session is not open for enrollment");
        }
        
        if (session.getCapacity() != null && session.getEnrolledCount() >= session.getCapacity()) {
            throw new BusinessException("SESSION_FULL", "Session has reached maximum capacity");
        }
        
        // Vérifier si déjà inscrit
        if (sessionEnrollmentRepository.existsByUserIdAndSessionIdAndStatus(userId, sessionId, "ACTIVE")) {
            throw new BusinessException("ALREADY_ENROLLED", "User is already enrolled in this session");
        }
        
        // Inscrire l'utilisateur au cours
        enrollmentService.enroll(userId, session.getCourse().getId());
        
        // Créer l'inscription à la session
        SessionEnrollment sessionEnrollment = SessionEnrollment.builder()
            .userId(userId)
            .session(session)
            .status("ACTIVE")
            .build();
        sessionEnrollmentRepository.save(sessionEnrollment);
        
        // Incrémenter le compteur
        session.setEnrolledCount(session.getEnrolledCount() + 1);
        sessionRepository.save(session);
    }
    
    public boolean isUserEnrolledInSession(Long userId, Long sessionId) {
        return sessionEnrollmentRepository.existsByUserIdAndSessionIdAndStatus(
            userId, sessionId, "ACTIVE"
        );
    }
    
    public java.util.List<Long> getUserEnrolledSessionIds(Long userId) {
        return sessionEnrollmentRepository.findSessionIdsByUserId(userId);
    }
    
    @Transactional
    public void deleteSession(Long sessionId) {
        // Verify session exists
        if (!sessionRepository.existsById(sessionId)) {
            throw new BusinessException("SESSION_NOT_FOUND", "Session not found");
        }
        
        // Direct delete
        sessionRepository.deleteById(sessionId);
    }
    
    public java.util.List<Session> getSessionsByInstructorId(Long instructorId) {
        return sessionRepository.findByInstructorId(instructorId);
    }
}
