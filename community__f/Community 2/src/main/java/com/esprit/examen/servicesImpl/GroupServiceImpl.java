package com.esprit.examen.servicesImpl;

import com.esprit.examen.dto.GroupMembershipItemDTO;
import com.esprit.examen.entities.Group;
import com.esprit.examen.entities.GroupMember;
import com.esprit.examen.entities.Post;
import com.esprit.examen.repositories.GroupMemberRepository;
import com.esprit.examen.repositories.GroupRepository;
import com.esprit.examen.repositories.PostRepository;
import com.esprit.examen.services.GroupService;
import com.esprit.examen.services.UserService;
import jakarta.annotation.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class GroupServiceImpl implements GroupService {

    @Resource
    private GroupRepository groupRepository;

    @Resource
    private UserService userService;

    @Resource
    private GroupMemberRepository groupMemberRepository;

    @Resource
    private PostRepository postRepository;

    @Override
    public Group createGroup(Group group, Long currentUserId) {
        if (!userService.userExists(currentUserId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with ID: " + currentUserId);
        }

        group.setCreatedBy(currentUserId);
        group.setCreatedAt(LocalDateTime.now());

        Group savedGroup = groupRepository.save(group);

        if (!groupMemberRepository.existsByGroupGroupIdAndUserId(savedGroup.getGroupId(), currentUserId)) {
            GroupMember adminMembership = new GroupMember();
            adminMembership.setUserId(currentUserId);
            adminMembership.setGroup(savedGroup);
            adminMembership.setRole("admin");
            adminMembership.setJoinedAt(LocalDateTime.now());
            groupMemberRepository.save(adminMembership);
        }

        return savedGroup;
    }

    @Override
    public Group getGroupById(Long id) {
        return groupRepository.findById(id).orElse(null);
    }

    @Override
    public List<Group> getAllGroups() {
        return groupRepository.findAll();
    }

    @Override
    public List<Group> searchGroups(String keyword) {
        return groupRepository.findByNameContainingIgnoreCase(keyword);
    }

    @Override
    public GroupMember joinGroup(Long currentUserId, Long groupId) {
        if (!userService.userExists(currentUserId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with ID: " + currentUserId);
        }

        Group group = groupRepository.findById(groupId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Group not found with ID: " + groupId));

        if (groupMemberRepository.existsByGroupGroupIdAndUserId(groupId, currentUserId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Already a member");
        }

        String role = currentUserId.equals(group.getCreatedBy()) ? "admin" : "membre";

        GroupMember groupMember = new GroupMember();
        groupMember.setUserId(currentUserId);
        groupMember.setGroup(group);
        groupMember.setRole(role);
        groupMember.setJoinedAt(LocalDateTime.now());
        return groupMemberRepository.save(groupMember);
    }

    @Override
    public void leaveGroup(Long currentUserId, Long groupId) {
        Group group = groupRepository.findById(groupId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Group not found with ID: " + groupId));

        GroupMember membership = groupMemberRepository.findByGroupGroupIdAndUserId(groupId, currentUserId);
        if (membership == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Membership not found");
        }

        if (currentUserId.equals(group.getCreatedBy())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Group creator cannot leave");
        }

        groupMemberRepository.delete(membership);
    }

    @Override
    public GroupMember getMembership(Long currentUserId, Long groupId) {
        return groupMemberRepository.findByGroupGroupIdAndUserId(groupId, currentUserId);
    }

    @Override
    public boolean isMember(Long currentUserId, Long groupId) {
        return getMembership(currentUserId, groupId) != null;
    }

    @Override
    public List<GroupMembershipItemDTO> getMemberships(Long currentUserId) {
        return groupMemberRepository.findByUserId(currentUserId)
            .stream()
            .filter(member -> member.getGroup() != null && member.getGroup().getGroupId() != null)
            .map(member -> new GroupMembershipItemDTO(
                member.getGroup().getGroupId(),
                member.getRole(),
                member.getJoinedAt()
            ))
            .distinct()
            .toList();
    }

    @Override
    public List<Post> getGroupPostsForMember(Long currentUserId, Long groupId) {
        if (!groupRepository.existsById(groupId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Group not found with ID: " + groupId);
        }

        if (!isMember(currentUserId, groupId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        return postRepository.findByGroupId(groupId);
    }

    @Override
    public long getGroupMembersCount(Long groupId) {
        return groupMemberRepository.countByGroupGroupId(groupId);
    }

    @Override
    public Group updateGroup(Long id, Group group) {
        Group existing = groupRepository.findById(id).orElse(null);
        if (existing != null) {
            existing.setName(group.getName());
            existing.setDescription(group.getDescription());
            return groupRepository.save(existing);
        }
        return null;
    }

    @Override
    public void deleteGroup(Long id) {
        groupRepository.deleteById(id);
    }
}
