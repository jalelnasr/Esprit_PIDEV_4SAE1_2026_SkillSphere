package com.esprit.examen.servicesImpl;

import com.esprit.examen.entities.Group;
import com.esprit.examen.entities.GroupMember;
import com.esprit.examen.services.UserService;
import com.esprit.examen.repositories.GroupMemberRepository;
import com.esprit.examen.repositories.GroupRepository;
import com.esprit.examen.services.GroupMemberService;
import jakarta.annotation.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class GroupMemberServiceImpl implements GroupMemberService {

    @Resource
    private GroupMemberRepository groupMemberRepository;

    @Resource
    private UserService userService;

    @Resource
    private GroupRepository groupRepository;

    @Override
    public GroupMember joinGroup(Long userId, Long groupId, String role) {
        if (!userService.userExists(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with ID: " + userId);
        }

        if (groupMemberRepository.existsByGroupGroupIdAndUserId(groupId, userId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User already joined");
        }

        Group group = groupRepository.findById(groupId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Group not found with ID: " + groupId));

        GroupMember groupMember = new GroupMember();
        groupMember.setUserId(userId);
        groupMember.setGroup(group);
        groupMember.setRole((role == null || role.isBlank()) ? "MEMBER" : role);
        groupMember.setJoinedAt(LocalDateTime.now());
        // Don't set groupMemberId - let database auto-generate it
        return groupMemberRepository.save(groupMember);
    }

    @Override
    public void leaveGroup(Long userId, Long groupId) {
        GroupMember groupMember = groupMemberRepository.findByGroupGroupIdAndUserId(groupId, userId);
        if (groupMember != null) {
            groupMemberRepository.delete(groupMember);
        }
    }

    @Override
    public List<GroupMember> getMembersByGroup(Long groupId) {
        return groupMemberRepository.findByGroupGroupId(groupId);
    }

    @Override
    public List<GroupMember> getGroupsByUser(Long userId) {
        return groupMemberRepository.findByUserId(userId);
    }

    @Override
    public GroupMember updateMemberRole(Long groupId, Long userId, String role) {
        GroupMember groupMember = groupMemberRepository.findByGroupGroupIdAndUserId(groupId, userId);
        if (groupMember != null) {
            groupMember.setRole(role);
            return groupMemberRepository.save(groupMember);
        }
        return null;
    }
}
