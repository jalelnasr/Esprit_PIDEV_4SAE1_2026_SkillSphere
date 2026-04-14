package com.esprit.examen.servicesImpl;

import com.esprit.examen.dto.NotificationEventDTO;
import com.esprit.examen.entities.Message;
import com.esprit.examen.repositories.MessageRepository;
import com.esprit.examen.services.NotificationSseService;
import com.esprit.examen.services.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MessageServiceImplTest {

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private UserService userService;

    @Mock
    private NotificationSseService notificationSseService;

    @InjectMocks
    private MessageServiceImpl messageService;

    @Test
    void sendMessage_throwsWhenSenderMissing() {
        when(userService.userExists(1L)).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> messageService.sendMessage(new Message(), 1L, 2L));

        assertEquals("Sender not found with ID: 1", ex.getMessage());
    }

    @Test
    void sendMessage_throwsWhenReceiverMissing() {
        when(userService.userExists(1L)).thenReturn(true);
        when(userService.userExists(2L)).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> messageService.sendMessage(new Message(), 1L, 2L));

        assertEquals("Receiver not found with ID: 2", ex.getMessage());
    }

    @Test
    void sendMessage_persistsAndNotifiesReceiver() {
        Message payload = new Message();
        payload.setContent("Hello");

        when(userService.userExists(1L)).thenReturn(true);
        when(userService.userExists(2L)).thenReturn(true);
        when(messageRepository.save(any(Message.class))).thenAnswer(invocation -> {
            Message message = invocation.getArgument(0);
            message.setMessageId(99L);
            return message;
        });
        when(userService.getDisplayName(1L)).thenReturn("Alice");

        Message saved = messageService.sendMessage(payload, 1L, 2L);

        assertEquals(1L, saved.getSenderId());
        assertEquals(2L, saved.getReceiverId());
        assertEquals(false, saved.getIsRead());
        assertNotNull(saved.getCreatedAt());
        verify(notificationSseService).sendToUser(eq(2L), any(NotificationEventDTO.class));
    }

    @Test
    void sendMessage_skipsNotificationForSelfMessage() {
        when(userService.userExists(1L)).thenReturn(true);
        when(messageRepository.save(any(Message.class))).thenAnswer(invocation -> invocation.getArgument(0));

        messageService.sendMessage(new Message(), 1L, 1L);

        verify(notificationSseService, never()).sendToUser(any(Long.class), any(NotificationEventDTO.class));
    }

    @Test
    void getMessageById_returnsEntityOrNull() {
        Message message = new Message();
        message.setMessageId(3L);

        when(messageRepository.findById(3L)).thenReturn(Optional.of(message));
        when(messageRepository.findById(4L)).thenReturn(Optional.empty());

        assertEquals(3L, messageService.getMessageById(3L).getMessageId());
        assertNull(messageService.getMessageById(4L));
    }

    @Test
    void getConversation_validatesUsersThenFetchesConversation() {
        when(userService.userExists(1L)).thenReturn(true);
        when(userService.userExists(2L)).thenReturn(true);
        when(messageRepository.findConversationMessages(1L, 2L)).thenReturn(List.of(new Message()));

        assertEquals(1, messageService.getConversation(1L, 2L).size());
    }

    @Test
    void getConversation_throwsWhenAnyUserMissing() {
        when(userService.userExists(1L)).thenReturn(false);
        assertThrows(RuntimeException.class, () -> messageService.getConversation(1L, 2L));

        when(userService.userExists(1L)).thenReturn(true);
        when(userService.userExists(2L)).thenReturn(false);
        assertThrows(RuntimeException.class, () -> messageService.getConversation(1L, 2L));
    }

    @Test
    void simpleListMethods_delegateToRepository() {
        when(messageRepository.findConversationMessages(1L, 2L)).thenReturn(List.of(new Message()));
        when(messageRepository.findBySenderId(1L)).thenReturn(List.of(new Message(), new Message()));
        when(messageRepository.findByReceiverId(2L)).thenReturn(List.of(new Message()));
        when(messageRepository.findByReceiverIdAndIsReadFalse(2L)).thenReturn(List.of(new Message()));

        assertEquals(1, messageService.getMessagesBetweenUsers(1L, 2L).size());
        assertEquals(2, messageService.getSentMessages(1L).size());
        assertEquals(1, messageService.getReceivedMessages(2L).size());
        assertEquals(1, messageService.getUnreadMessages(2L).size());
    }

    @Test
    void markAsRead_updatesWhenMessageExists() {
        Message message = new Message();
        message.setMessageId(8L);
        message.setIsRead(false);

        when(messageRepository.findById(8L)).thenReturn(Optional.of(message));
        when(messageRepository.save(any(Message.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Message updated = messageService.markAsRead(8L);

        assertNotNull(updated);
        assertEquals(true, updated.getIsRead());
    }

    @Test
    void markAsRead_returnsNullWhenMessageMissing() {
        when(messageRepository.findById(8L)).thenReturn(Optional.empty());

        assertNull(messageService.markAsRead(8L));
    }

    @Test
    void deleteMessage_delegates() {
        messageService.deleteMessage(5L);

        verify(messageRepository).deleteById(5L);
    }
}
