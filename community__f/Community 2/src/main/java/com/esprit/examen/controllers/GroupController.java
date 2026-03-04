package com.esprit.examen.controllers;

import com.esprit.examen.dto.GroupJoinResponseDTO;
import com.esprit.examen.dto.GroupMembershipResponseDTO;
import com.esprit.examen.dto.GroupMembershipsResponseDTO;
import com.esprit.examen.entities.Group;
import com.esprit.examen.entities.GroupMember;
import com.esprit.examen.entities.Post;
import com.esprit.examen.services.GroupService;
import com.esprit.examen.services.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
@Tag(name = "Group", description = "Group management APIs")
public class GroupController {

    @Autowired
    private GroupService groupService;

    @Autowired
    private UserService userService;

    @PostMapping
    @Operation(summary = "Create a new group")
    public ResponseEntity<Group> createGroup(@RequestBody Group group) {
        Long currentUserId = userService.getCurrentUserId();
        return ResponseEntity.ok(groupService.createGroup(group, currentUserId));
    }

    @GetMapping
    @Operation(summary = "Get all groups")
    public ResponseEntity<List<Group>> getAllGroups() {
        return ResponseEntity.ok(groupService.getAllGroups());
    }

    @PostMapping("/{groupId}/join")
    @Operation(summary = "Join group with authenticated user")
    public ResponseEntity<GroupJoinResponseDTO> joinGroup(@PathVariable Long groupId) {
        Long currentUserId = userService.getCurrentUserId();
        GroupMember groupMember = groupService.joinGroup(currentUserId, groupId);

        return ResponseEntity.ok(new GroupJoinResponseDTO(
            groupId,
            currentUserId,
            true,
            groupMember.getRole(),
            groupMember.getJoinedAt(),
            "Joined"
        ));
    }

    @DeleteMapping("/{groupId}/leave")
    @Operation(summary = "Leave group with authenticated user")
    public ResponseEntity<GroupJoinResponseDTO> leaveGroup(@PathVariable Long groupId) {
        Long currentUserId = userService.getCurrentUserId();
        groupService.leaveGroup(currentUserId, groupId);

        return ResponseEntity.ok(new GroupJoinResponseDTO(
            groupId,
            currentUserId,
            false,
            null,
            null,
            "Left"
        ));
    }

    @GetMapping("/{groupId}/membership")
    @Operation(summary = "Check if authenticated user joined a group")
    public ResponseEntity<GroupMembershipResponseDTO> getMembership(@PathVariable Long groupId) {
        Long currentUserId = userService.getCurrentUserId();
        GroupMember membership = groupService.getMembership(currentUserId, groupId);
        boolean isMember = membership != null;
        String role = isMember ? membership.getRole() : null;
        return ResponseEntity.ok(new GroupMembershipResponseDTO(groupId, isMember, role));
    }

    @GetMapping("/memberships")
    @Operation(summary = "Get all joined group ids for authenticated user")
    public ResponseEntity<GroupMembershipsResponseDTO> getMemberships() {
        Long currentUserId = userService.getCurrentUserId();
        return ResponseEntity.ok(new GroupMembershipsResponseDTO(groupService.getMemberships(currentUserId)));
    }

    @GetMapping("/{groupId}/posts")
    @Operation(summary = "Get group posts for authenticated member")
    public ResponseEntity<List<Post>> getGroupPosts(@PathVariable Long groupId) {
        Long currentUserId = userService.getCurrentUserId();
        return ResponseEntity.ok(groupService.getGroupPostsForMember(currentUserId, groupId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get group by ID")
    public ResponseEntity<Group> getGroupById(@PathVariable Long id) {
        return ResponseEntity.ok(groupService.getGroupById(id));
    }

    @GetMapping("/search")
    @Operation(summary = "Search groups by keyword")
    public ResponseEntity<List<Group>> searchGroups(@RequestParam String keyword) {
        return ResponseEntity.ok(groupService.searchGroups(keyword));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update group by ID")
    public ResponseEntity<Group> updateGroup(@PathVariable Long id, @RequestBody Group group) {
        return ResponseEntity.ok(groupService.updateGroup(id, group));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete group by ID")
    public ResponseEntity<Void> deleteGroup(@PathVariable Long id) {
        groupService.deleteGroup(id);
        return ResponseEntity.ok().build();
    }
}
