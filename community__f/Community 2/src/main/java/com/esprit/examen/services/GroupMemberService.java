package com.esprit.examen.services;

import com.esprit.examen.entities.GroupMember;

import java.util.List;

public interface GroupMemberService {
    GroupMember joinGroup(Long userId, Long groupId, String role);
    void leaveGroup(Long userId, Long groupId);
    List<GroupMember> getMembersByGroup(Long groupId);
    List<GroupMember> getGroupsByUser(Long userId);
    GroupMember updateMemberRole(Long groupId, Long userId, String role);
}
