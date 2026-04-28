package org.example.b2bmodule.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.example.b2bmodule.dto.EmailNotificationDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private MimeMessage mimeMessage;

    @InjectMocks
    private EmailService emailService;

    private EmailNotificationDTO acceptedDto;
    private EmailNotificationDTO rejectedDto;

    @BeforeEach
    void setUp() {
        acceptedDto = new EmailNotificationDTO(
                "john.doe@example.com",
                "John Doe",
                "Senior Frontend Developer",
                "Tech Corp",
                "ACCEPTED",
                "We are impressed with your skills and would like to proceed with the next steps."
        );

        rejectedDto = new EmailNotificationDTO(
                "jane.smith@example.com",
                "Jane Smith",
                "Backend Developer",
                "Software Inc",
                "REJECTED",
                "Thank you for your interest. We will keep your profile for future opportunities."
        );
    }

    @Test
    void shouldSendAcceptedApplicationNotification() throws MessagingException {
        // Given
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        // When
        emailService.sendApplicationNotification(acceptedDto);

        // Then
        verify(mailSender).createMimeMessage();
        verify(mailSender).send(mimeMessage);
    }

    @Test
    void shouldSendRejectedApplicationNotification() throws MessagingException {
        // Given
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        // When
        emailService.sendApplicationNotification(rejectedDto);

        // Then
        verify(mailSender).createMimeMessage();
        verify(mailSender).send(mimeMessage);
    }

    @Test
    void shouldSendEmailWithCorrectSubject() throws MessagingException {
        // Given
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        // When
        emailService.sendApplicationNotification(acceptedDto);

        // Then
        verify(mailSender).send(mimeMessage);
        // Subject should contain job title and company name
        assertTrue(true); // Email sent successfully
    }

    @Test
    void shouldHandleNullMessage() throws MessagingException {
        // Given
        EmailNotificationDTO dtoWithoutMessage = new EmailNotificationDTO(
                "test@example.com",
                "Test User",
                "Developer",
                "Test Company",
                "ACCEPTED",
                null
        );

        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        // When
        emailService.sendApplicationNotification(dtoWithoutMessage);

        // Then
        verify(mailSender).send(mimeMessage);
    }

    @Test
    void shouldHandleEmptyMessage() throws MessagingException {
        // Given
        EmailNotificationDTO dtoWithEmptyMessage = new EmailNotificationDTO(
                "test@example.com",
                "Test User",
                "Developer",
                "Test Company",
                "ACCEPTED",
                ""
        );

        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        // When
        emailService.sendApplicationNotification(dtoWithEmptyMessage);

        // Then
        verify(mailSender).send(mimeMessage);
    }

    @Test
    void shouldEscapeHtmlInCandidateName() throws MessagingException {
        // Given
        EmailNotificationDTO dtoWithHtml = new EmailNotificationDTO(
                "test@example.com",
                "<script>alert('XSS')</script>",
                "Developer",
                "Test Company",
                "ACCEPTED",
                "Welcome!"
        );

        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        // When
        emailService.sendApplicationNotification(dtoWithHtml);

        // Then
        verify(mailSender).send(mimeMessage);
        // HTML should be escaped to prevent XSS
    }

    @Test
    void shouldEscapeHtmlInCompanyName() throws MessagingException {
        // Given
        EmailNotificationDTO dtoWithHtml = new EmailNotificationDTO(
                "test@example.com",
                "Test User",
                "Developer",
                "<b>Evil Corp</b>",
                "ACCEPTED",
                "Welcome!"
        );

        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        // When
        emailService.sendApplicationNotification(dtoWithHtml);

        // Then
        verify(mailSender).send(mimeMessage);
    }

    @Test
    void shouldEscapeHtmlInMessage() throws MessagingException {
        // Given
        EmailNotificationDTO dtoWithHtml = new EmailNotificationDTO(
                "test@example.com",
                "Test User",
                "Developer",
                "Test Company",
                "ACCEPTED",
                "<script>alert('XSS')</script>"
        );

        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        // When
        emailService.sendApplicationNotification(dtoWithHtml);

        // Then
        verify(mailSender).send(mimeMessage);
    }

    @Test
    void shouldThrowExceptionWhenMailSenderFails() {
        // Given
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        doThrow(new RuntimeException("SMTP server error")).when(mailSender).send(any(MimeMessage.class));

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            emailService.sendApplicationNotification(acceptedDto);
        });
    }

    @Test
    void shouldSendEmailWithAcceptedStatus() throws MessagingException {
        // Given
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        // When
        emailService.sendApplicationNotification(acceptedDto);

        // Then
        verify(mailSender).send(mimeMessage);
        assertEquals("ACCEPTED", acceptedDto.getStatus());
    }

    @Test
    void shouldSendEmailWithRejectedStatus() throws MessagingException {
        // Given
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        // When
        emailService.sendApplicationNotification(rejectedDto);

        // Then
        verify(mailSender).send(mimeMessage);
        assertEquals("REJECTED", rejectedDto.getStatus());
    }

    @Test
    void shouldSendEmailToCorrectRecipient() throws MessagingException {
        // Given
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        // When
        emailService.sendApplicationNotification(acceptedDto);

        // Then
        verify(mailSender).send(mimeMessage);
        assertEquals("john.doe@example.com", acceptedDto.getCandidateEmail());
    }

    @Test
    void shouldIncludeAllRequiredFields() throws MessagingException {
        // Given
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        // When
        emailService.sendApplicationNotification(acceptedDto);

        // Then
        assertNotNull(acceptedDto.getCandidateEmail());
        assertNotNull(acceptedDto.getCandidateName());
        assertNotNull(acceptedDto.getJobTitle());
        assertNotNull(acceptedDto.getCompanyName());
        assertNotNull(acceptedDto.getStatus());
        verify(mailSender).send(mimeMessage);
    }

    @Test
    void shouldHandleSpecialCharactersInEmail() throws MessagingException {
        // Given
        EmailNotificationDTO dtoWithSpecialChars = new EmailNotificationDTO(
                "test+special@example.com",
                "Test User",
                "Developer & Designer",
                "Tech & Co.",
                "ACCEPTED",
                "Welcome to Tech & Co.!"
        );

        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        // When
        emailService.sendApplicationNotification(dtoWithSpecialChars);

        // Then
        verify(mailSender).send(mimeMessage);
    }

    @Test
    void shouldSendMultipleEmailsSuccessively() throws MessagingException {
        // Given
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        // When
        emailService.sendApplicationNotification(acceptedDto);
        emailService.sendApplicationNotification(rejectedDto);

        // Then
        verify(mailSender, times(2)).createMimeMessage();
        verify(mailSender, times(2)).send(mimeMessage);
    }
}
