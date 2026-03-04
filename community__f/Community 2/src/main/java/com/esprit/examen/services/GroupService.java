package com.esprit.examen.services;

import com.esprit.examen.dto.GroupMembershipItemDTO;
import com.esprit.examen.entities.Group;
import com.esprit.examen.entities.GroupMember;
import com.esprit.examen.entities.Post;

import java.util.List;

public interface GroupService {
    Group createGroup(Group group, Long currentUserId);
    Group getGroupById(Long id);
    List<Group> getAllGroups();
    List<Group> searchGroups(String keyword);
    GroupMember joinGroup(Long currentUserId, Long groupId);
    void leaveGroup(Long currentUserId, Long groupId);
    GroupMember getMembership(Long currentUserId, Long groupId);
    boolean isMember(Long currentUserId, Long groupId);
    List<GroupMembershipItemDTO> getMemberships(Long currentUserId);
    List<Post> getGroupPostsForMember(Long currentUserId, Long groupId);
    long getGroupMembersCount(Long groupId);
    Group updateGroup(Long id, Group group);
    void deleteGroup(Long id);
}
