package com.esprit.examen.controllers;

import com.esprit.examen.entities.GroupMember;
import com.esprit.examen.services.GroupMemberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/group-members")
@Tag(name = "Group Member", description = "Group member management APIs")
public class GroupMemberController {

    @Autowired
    private GroupMemberService groupMemberService;

    @PostMapping("/{userId}/{groupId}")
    @Operation(summary = "Join a group")
    public ResponseEntity<GroupMember> joinGroup(@PathVariable Long userId, @PathVariable Long groupId, @RequestParam(defaultValue = "MEMBER") String role) {
        return ResponseEntity.ok(groupMemberService.joinGroup(userId, groupId, role));
    }

    @DeleteMapping("/{userId}/{groupId}")
    @Operation(summary = "Leave a group")
    public ResponseEntity<Void> leaveGroup(@PathVariable Long userId, @PathVariable Long groupId) {
        groupMemberService.leaveGroup(userId, groupId);
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
        return ResponseEntity.ok(groupMemberService.updateMemberRole(groupId, userId, role));
    }
}