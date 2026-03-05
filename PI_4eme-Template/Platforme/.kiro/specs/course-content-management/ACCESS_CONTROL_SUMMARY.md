# Access Control Summary: Course Content Management

## Overview

This document clarifies the access control rules for course content in the learning management system.

## Access Levels

### 1. Formation Preview (Public - All Authenticated Users)

**What users can see:**
- Formation title
- Formation description
- Formation image
- Formation price
- Basic metadata (duration, level, instructor name)

**Who can access:**
- ✅ All authenticated users (APPRENANT, FORMATEUR, RH_ENTREPRISE, ADMIN)
- ✅ Regardless of enrollment status
- ✅ Only for PUBLISHED formations

**Use case:** Browse course catalog, decide whether to enroll

---

### 2. Formation Content (Restricted - Enrolled Users Only)

**What users can see:**
- Complete chapter list
- All lessons within chapters
- Video URLs and players
- PDF downloads
- Lesson descriptions and materials

**Who can access:**
- ✅ Users ENROLLED in a session of that formation
- ✅ Formation OWNER (the formateur who created it)
- ✅ ADMIN users (platform administrators)
- ❌ Non-enrolled APPRENANT users

**Use case:** Learn from enrolled courses, watch videos, download materials

---

### 3. Content Management (Restricted - Owners Only)

**What users can do:**
- Create, edit, delete chapters
- Create, edit, delete lessons
- Upload videos and PDFs
- Reorder content
- Manage formation structure

**Who can access:**
- ✅ Formation OWNER (the formateur who created it)
- ✅ ADMIN users (platform administrators)
- ❌ Other FORMATEUR users (can't edit others' formations)
- ❌ APPRENANT users
- ❌ RH_ENTREPRISE users

**Use case:** Build and maintain course content

---

## Access Control Flow

```
User requests formation content
    ↓
Is formation PUBLISHED?
    ├─ NO → Check if user is OWNER or ADMIN
    │        ├─ YES → Grant access
    │        └─ NO → Return 403 Forbidden
    │
    └─ YES → Check if user wants PREVIEW or FULL CONTENT
             ├─ PREVIEW (basic info) → Grant access to all authenticated users
             │
             └─ FULL CONTENT (chapters/lessons/videos)
                  ├─ Is user ENROLLED in a session? → Grant access
                  ├─ Is user the OWNER? → Grant access
                  ├─ Is user ADMIN? → Grant access
                  └─ Otherwise → Return 403 "Enroll to access this content"
```

## Implementation

### Backend (AccessControlService)

```java
@Service
public class AccessControlService {
    
    // Check if user can modify formation content
    boolean canModifyFormation(Long formationId, Long userId) {
        return isFormationOwner(formationId, userId) || isAdmin(userId);
    }
    
    // Check if user can view full formation content
    boolean canViewFormationContent(Long formationId, Long userId) {
        return isUserEnrolledInFormation(formationId, userId) 
            || isFormationOwner(formationId, userId) 
            || isAdmin(userId);
    }
    
    // Check if user is enrolled in any session of the formation
    boolean isUserEnrolledInFormation(Long formationId, Long userId) {
        // Query enrollments table for active enrollment
        // WHERE formation_id = ? AND user_id = ? AND status = 'ACTIVE'
    }
    
    // Check if user owns the formation
    boolean isFormationOwner(Long formationId, Long userId) {
        // Query formations table
        // WHERE id = ? AND created_by = ?
    }
}
```

### Frontend (Content Display)

```typescript
// Show preview to everyone
<div class="formation-preview">
  <h2>{{ formation.title }}</h2>
  <p>{{ formation.description }}</p>
  <img [src]="formation.imageUrl" />
  <span>{{ formation.price }}</span>
</div>

// Show full content only if enrolled
<div class="formation-content" *ngIf="isEnrolled || isOwner || isAdmin">
  <app-chapter-list [chapters]="chapters"></app-chapter-list>
</div>

// Show enrollment prompt if not enrolled
<div class="enrollment-prompt" *ngIf="!isEnrolled && !isOwner && !isAdmin">
  <p>Enroll to access this content</p>
  <button (click)="enrollInCourse()">Enroll Now</button>
</div>
```

## Error Messages

### 403 Forbidden - Not Enrolled
```json
{
  "status": 403,
  "error": "Access Denied",
  "message": "Enroll to access this content",
  "action": "enroll_required"
}
```

### 403 Forbidden - Not Owner
```json
{
  "status": 403,
  "error": "Access Denied",
  "message": "You do not have permission to modify this formation",
  "action": "owner_required"
}
```

### 404 Not Found - Unpublished
```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Formation not found or not published"
}
```

## Summary

| User Type | Preview | View Content | Edit Content |
|-----------|---------|--------------|--------------|
| Non-enrolled APPRENANT | ✅ | ❌ | ❌ |
| Enrolled APPRENANT | ✅ | ✅ | ❌ |
| Formation OWNER | ✅ | ✅ | ✅ |
| Other FORMATEUR | ✅ | ❌ | ❌ |
| ADMIN | ✅ | ✅ | ✅ |

**Key Principle:** Content is locked behind enrollment. Users must enroll in a session to access the full course content (chapters, lessons, videos, PDFs).
