package com.esprit.examen.servicesImpl;

import com.esprit.examen.dto.GroupMembershipItemDTO;
import com.esprit.examen.entities.Group;
import com.esprit.examen.entities.GroupMember;
import com.esprit.examen.entities.Post;
import com.esprit.examen.repositories.GroupMemberRepository;
import com.esprit.examen.repositories.GroupRepository;
import com.esprit.examen.repositories.PostRepository;
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
class GroupServiceImplTest {

    @Mock
    private GroupRepository groupRepository;

    @Mock
    private UserService userService;

    @Mock
    private GroupMemberRepository groupMemberRepository;

    @Mock
    private PostRepository postRepository;

    @InjectMocks
    private GroupServiceImpl groupService;

    @Test
    void createGroup_throwsWhenCreatorMissing() {
        when(userService.userExists(1L)).thenReturn(false);

        assertThrows(ResponseStatusException.class, () -> groupService.createGroup(new Group(), 1L));
    }

    @Test
    void createGroup_savesGroupAndAdminMembership() {
        Group group = new Group();
        group.setName("Dev");

        Group saved = new Group();
        saved.setGroupId(8L);
        saved.setName("Dev");
        saved.setCreatedBy(5L);

        when(userService.userExists(5L)).thenReturn(true);
        when(groupRepository.save(any(Group.class))).thenReturn(saved);
        when(groupMemberRepository.existsByGroupGroupIdAndUserId(8L, 5L)).thenReturn(false);

        Group result = groupService.createGroup(group, 5L);

        assertEquals(8L, result.getGroupId());
        verify(groupMemberRepository).save(any(GroupMember.class));
    }

    @Test
    void createGroup_skipsMembershipWhenAlreadyExists() {
        Group saved = new Group();
        saved.setGroupId(8L);

        when(userService.userExists(5L)).thenReturn(true);
        when(groupRepository.save(any(Group.class))).thenReturn(saved);
        when(groupMemberRepository.existsByGroupGroupIdAndUserId(8L, 5L)).thenReturn(true);

        groupService.createGroup(new Group(), 5L);

        verify(groupMemberRepository, never()).save(any(GroupMember.class));
    }

    @Test
    void getGroupById_returnsEntityOrNull() {
        Group group = new Group();
        group.setGroupId(3L);

        when(groupRepository.findById(3L)).thenReturn(Optional.of(group));
        when(groupRepository.findById(4L)).thenReturn(Optional.empty());

        assertEquals(3L, groupService.getGroupById(3L).getGroupId());
        assertNull(groupService.getGroupById(4L));
    }

    @Test
    void getAllGroups_andSearchGroups_delegate() {
        when(groupRepository.findAll()).thenReturn(List.of(new Group(), new Group()));
        when(groupRepository.findByNameContainingIgnoreCase("java")).thenReturn(List.of(new Group()));

        assertEquals(2, groupService.getAllGroups().size());
        assertEquals(1, groupService.searchGroups("java").size());
    }

    @Test
    void joinGroup_throwsWhenAlreadyMember() {
        Group group = new Group();
        group.setGroupId(9L);
        group.setCreatedBy(2L);

        when(userService.userExists(2L)).thenReturn(true);
        when(groupRepository.findById(9L)).thenReturn(Optional.of(group));
        when(groupMemberRepository.existsByGroupGroupIdAndUserId(9L, 2L)).thenReturn(true);

        assertThrows(ResponseStatusException.class, () -> groupService.joinGroup(2L, 9L));
    }

    @Test
    void joinGroup_assignsRoleBasedOnCreator() {
        Group group = new Group();
        group.setGroupId(9L);
        group.setCreatedBy(2L);

        when(userService.userExists(2L)).thenReturn(true);
        when(groupRepository.findById(9L)).thenReturn(Optional.of(group));
        when(groupMemberRepository.existsByGroupGroupIdAndUserId(9L, 2L)).thenReturn(false);
        when(groupMemberRepository.save(any(GroupMember.class))).thenAnswer(invocation -> invocation.getArgument(0));

        GroupMember creatorMembership = groupService.joinGroup(2L, 9L);

        assertEquals("admin", creatorMembership.getRole());

        Group otherGroup = new Group();
        otherGroup.setGroupId(10L);
        otherGroup.setCreatedBy(99L);

        when(userService.userExists(3L)).thenReturn(true);
        when(groupRepository.findById(10L)).thenReturn(Optional.of(otherGroup));
        when(groupMemberRepository.existsByGroupGroupIdAndUserId(10L, 3L)).thenReturn(false);

        GroupMember normalMembership = groupService.joinGroup(3L, 10L);
        assertEquals("membre", normalMembership.getRole());
    }

    @Test
    void leaveGroup_throwsForCreatorAndDeletesForMember() {
        Group group = new Group();
        group.setGroupId(7L);
        group.setCreatedBy(1L);

        GroupMember membership = new GroupMember();
        membership.setGroup(group);

        when(groupRepository.findById(7L)).thenReturn(Optional.of(group));
        when(groupMemberRepository.findByGroupGroupIdAndUserId(7L, 1L)).thenReturn(membership);

        assertThrows(ResponseStatusException.class, () -> groupService.leaveGroup(1L, 7L));

        when(groupMemberRepository.findByGroupGroupIdAndUserId(7L, 2L)).thenReturn(membership);
        groupService.leaveGroup(2L, 7L);
        verify(groupMemberRepository).delete(membership);
    }

    @Test
    void getMembership_isMember_andMemberships_work() {
        Group group = new Group();
        group.setGroupId(21L);

        GroupMember membership = new GroupMember();
        membership.setGroup(group);
        membership.setUserId(6L);
        membership.setRole("MEMBER");

        when(groupMemberRepository.findByGroupGroupIdAndUserId(21L, 6L)).thenReturn(membership);
        when(groupMemberRepository.findByGroupGroupIdAndUserId(22L, 6L)).thenReturn(null);
        when(groupMemberRepository.findByUserId(6L)).thenReturn(List.of(membership));

        assertNotNull(groupService.getMembership(6L, 21L));
        assertEquals(true, groupService.isMember(6L, 21L));
        assertEquals(false, groupService.isMember(6L, 22L));

        List<GroupMembershipItemDTO> memberships = groupService.getMemberships(6L);
        assertEquals(1, memberships.size());
        assertEquals(21L, memberships.get(0).getGroupId());
    }

    @Test
    void getGroupPostsForMember_validatesMembershipAndReturnsPosts() {
        when(groupRepository.existsById(8L)).thenReturn(false);
        assertThrows(ResponseStatusException.class, () -> groupService.getGroupPostsForMember(1L, 8L));

        when(groupRepository.existsById(8L)).thenReturn(true);
        when(groupMemberRepository.findByGroupGroupIdAndUserId(8L, 1L)).thenReturn(null);
        assertThrows(ResponseStatusException.class, () -> groupService.getGroupPostsForMember(1L, 8L));

        GroupMember membership = new GroupMember();
        when(groupMemberRepository.findByGroupGroupIdAndUserId(8L, 1L)).thenReturn(membership);
        when(postRepository.findByGroupId(8L)).thenReturn(List.of(new Post()));

        assertEquals(1, groupService.getGroupPostsForMember(1L, 8L).size());
    }

    @Test
    void getGroupMembersCount_delegates() {
        when(groupMemberRepository.countByGroupGroupId(4L)).thenReturn(5L);

        assertEquals(5L, groupService.getGroupMembersCount(4L));
    }

    @Test
    void updateGroup_updatesWhenExists() {
        Group existing = new Group();
        existing.setGroupId(9L);
        existing.setName("old");

        Group payload = new Group();
        payload.setName("new");
        payload.setDescription("desc");

        when(groupRepository.findById(9L)).thenReturn(Optional.of(existing));
        when(groupRepository.save(any(Group.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Group updated = groupService.updateGroup(9L, payload);

        assertEquals("new", updated.getName());
        assertEquals("desc", updated.getDescription());
    }

    @Test
    void updateGroup_returnsNullWhenMissing() {
        when(groupRepository.findById(100L)).thenReturn(Optional.empty());

        assertNull(groupService.updateGroup(100L, new Group()));
    }

    @Test
    void deleteGroup_delegates() {
        groupService.deleteGroup(42L);

        verify(groupRepository).deleteById(42L);
    }
}
