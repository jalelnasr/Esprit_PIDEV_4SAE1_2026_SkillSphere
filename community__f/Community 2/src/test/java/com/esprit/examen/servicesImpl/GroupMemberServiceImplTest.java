package com.esprit.examen.servicesImpl;

import com.esprit.examen.entities.Group;
import com.esprit.examen.entities.GroupMember;
import com.esprit.examen.repositories.GroupMemberRepository;
import com.esprit.examen.repositories.GroupRepository;
import com.esprit.examen.services.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GroupMemberServiceImplTest {

    @Mock
    private GroupMemberRepository groupMemberRepository;

    @Mock
    private UserService userService;

    @Mock
    private GroupRepository groupRepository;

    @InjectMocks
    private GroupMemberServiceImpl groupMemberService;

    @Test
    void joinGroup_throwsWhenUserMissing() {
        when(userService.userExists(1L)).thenReturn(false);

        assertThrows(ResponseStatusException.class, () -> groupMemberService.joinGroup(1L, 2L, "MEMBER"));
    }

    @Test
    void joinGroup_throwsWhenAlreadyMember() {
        when(userService.userExists(1L)).thenReturn(true);
        when(groupMemberRepository.existsByGroupGroupIdAndUserId(2L, 1L)).thenReturn(true);

        assertThrows(ResponseStatusException.class, () -> groupMemberService.joinGroup(1L, 2L, "MEMBER"));
    }

    @Test
    void joinGroup_throwsWhenGroupMissing() {
        when(userService.userExists(1L)).thenReturn(true);
        when(groupMemberRepository.existsByGroupGroupIdAndUserId(2L, 1L)).thenReturn(false);
        when(groupRepository.findById(2L)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> groupMemberService.joinGroup(1L, 2L, "MEMBER"));
    }

    @Test
    void joinGroup_persistsMembershipAndDefaultRole() {
        Group group = new Group();
        group.setGroupId(2L);

        when(userService.userExists(1L)).thenReturn(true);
        when(groupMemberRepository.existsByGroupGroupIdAndUserId(2L, 1L)).thenReturn(false);
        when(groupRepository.findById(2L)).thenReturn(Optional.of(group));
        when(groupMemberRepository.save(any(GroupMember.class))).thenAnswer(invocation -> invocation.getArgument(0));

        GroupMember created = groupMemberService.joinGroup(1L, 2L, null);

        assertEquals(1L, created.getUserId());
        assertEquals("MEMBER", created.getRole());
        assertNotNull(created.getJoinedAt());
        assertNotNull(created.getGroup());
    }

    @Test
    void leaveGroup_deletesMembershipWhenPresent() {
        GroupMember membership = new GroupMember();
        when(groupMemberRepository.findByGroupGroupIdAndUserId(2L, 1L)).thenReturn(membership);

        groupMemberService.leaveGroup(1L, 2L);

        verify(groupMemberRepository).delete(membership);
    }

    @Test
    void leaveGroup_noopWhenMembershipMissing() {
        when(groupMemberRepository.findByGroupGroupIdAndUserId(2L, 1L)).thenReturn(null);

        groupMemberService.leaveGroup(1L, 2L);

        verify(groupMemberRepository, never()).delete(any(GroupMember.class));
    }

    @Test
    void getMembersByGroup_delegates() {
        when(groupMemberRepository.findByGroupGroupId(5L)).thenReturn(List.of(new GroupMember()));

        assertEquals(1, groupMemberService.getMembersByGroup(5L).size());
    }

    @Test
    void getGroupsByUser_delegates() {
        when(groupMemberRepository.findByUserId(5L)).thenReturn(List.of(new GroupMember(), new GroupMember()));

        assertEquals(2, groupMemberService.getGroupsByUser(5L).size());
    }

    @Test
    void updateMemberRole_updatesWhenExists() {
        GroupMember membership = new GroupMember();
        membership.setRole("MEMBER");

        when(groupMemberRepository.findByGroupGroupIdAndUserId(2L, 1L)).thenReturn(membership);
        when(groupMemberRepository.save(any(GroupMember.class))).thenAnswer(invocation -> invocation.getArgument(0));

        GroupMember updated = groupMemberService.updateMemberRole(2L, 1L, "admin");

        assertNotNull(updated);
        assertEquals("admin", updated.getRole());
    }

    @Test
    void updateMemberRole_returnsNullWhenMembershipMissing() {
        when(groupMemberRepository.findByGroupGroupIdAndUserId(2L, 1L)).thenReturn(null);

        assertNull(groupMemberService.updateMemberRole(2L, 1L, "admin"));
    }
}
