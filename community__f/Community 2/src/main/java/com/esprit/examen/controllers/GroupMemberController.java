package com.esprit.examen.controllers;

import com.esprit.examen.entities.GroupMember;
import com.esprit.examen.services.GroupMemberService;
import com.esprit.examen.services.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/group-members")
@Tag(name = "Group Member", description = "Group member management APIs")
public class GroupMemberController {

    @Autowired
    private GroupMemberService groupMemberService;

    @Autowired
    private UserService userService;

    @PostMapping("/{groupId}")
    @Operation(summary = "Join a group with authenticated user")
    public ResponseEntity<GroupMember> joinGroup(@PathVariable Long groupId, @RequestParam(defaultValue = "MEMBER") String role) {
        Long currentUserId = userService.getCurrentUserId();
        return ResponseEntity.ok(groupMemberService.joinGroup(currentUserId, groupId, role));
    }

    @PostMapping("/{userId}/{groupId}")
    @Operation(summary = "Join a group (legacy path with user id)")
    public ResponseEntity<GroupMember> joinGroup(@PathVariable Long userId, @PathVariable Long groupId, @RequestParam(defaultValue = "MEMBER") String role) {
        Long currentUserId = userService.getCurrentUserId();
        if (!currentUserId.equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot join group for another user");
        }

        return ResponseEntity.ok(groupMemberService.joinGroup(currentUserId, groupId, role));
    }

    @DeleteMapping("/{groupId}")
    @Operation(summary = "Leave a group with authenticated user")
    public ResponseEntity<Void> leaveGroup(@PathVariable Long groupId) {
        Long currentUserId = userService.getCurrentUserId();
        groupMemberService.leaveGroup(currentUserId, groupId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{userId}/{groupId}")
    @Operation(summary = "Leave a group (legacy path with user id)")
    public ResponseEntity<Void> leaveGroup(@PathVariable Long userId, @PathVariable Long groupId) {
        Long currentUserId = userService.getCurrentUserId();
        if (!currentUserId.equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot leave group for another user");
        }

        groupMemberService.leaveGroup(currentUserId, groupId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/group/{groupId}")
    @Operation(summary = "Get members by group")
    public ResponseEntity<List<GroupMember>> getMembersByGroup(@PathVariable Long groupId) {
        return ResponseEntity.ok(groupMemberService.getMembersByGroup(groupId));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get groups by user")
    public ResponseEntity<List<GroupMember>> getGroupsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(groupMemberService.getGroupsByUser(userId));
    }

    @PutMapping("/{groupId}/{userId}")
    @Operation(summary = "Update member role")
    public ResponseEntity<GroupMember> updateMemberRole(@PathVariable Long groupId, @PathVariable Long userId, @RequestParam String role) {
        if (!isAdmin()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can update member roles");
        }

        return ResponseEntity.ok(groupMemberService.updateMemberRole(groupId, userId, role));
    }

    private boolean isAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return false;
        }

        for (GrantedAuthority authority : authentication.getAuthorities()) {
            if ("ROLE_ADMIN".equals(authority.getAuthority())) {
                return true;
            }
        }

        return false;
    }
}
