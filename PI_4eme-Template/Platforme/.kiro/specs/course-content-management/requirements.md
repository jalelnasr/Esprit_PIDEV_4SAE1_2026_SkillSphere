# Requirements Document

## Introduction

This document defines the requirements for a course content management system that enables instructors (formateurs) to create and organize educational content within their courses (formations). The system provides a hierarchical structure: Course → Chapters → Lessons → Content Items (videos and PDFs), allowing formateurs to build structured learning paths for their students (apprenants).

## Glossary

- **Formation**: A course offering with title, description, image, and price
- **Session**: A scheduled instance of a formation with specific dates and capacity
- **Formateur**: An instructor who creates and manages course content
- **Apprenant**: A learner/student who consumes course content
- **Chapter**: A logical grouping of lessons within a formation (chapitre)
- **Lesson**: An individual learning unit within a chapter (leçon)
- **Content_Item**: A video or PDF resource attached to a lesson
- **Content_Management_System**: The system that manages chapters, lessons, and content items
- **Learning_Interface**: The formateur interface for managing course content
- **Enrollment**: A record linking a user to a session, granting access to the formation's content
- **Formation_Preview**: Basic formation information (title, description, image, price) visible to all users
- **Formation_Content**: Full course content (chapters, lessons, videos, PDFs) accessible only to enrolled users

## Requirements

### Requirement 1: Chapter Management

**User Story:** As a formateur, I want to create and organize chapters within my formations, so that I can structure the learning content logically.

#### Acceptance Criteria

1. WHEN a formateur creates a chapter, THE Content_Management_System SHALL associate it with a specific formation
2. THE Content_Management_System SHALL store chapter title and order position
3. WHEN a formateur updates a chapter, THE Content_Management_System SHALL persist the changes
4. WHEN a formateur deletes a chapter, THE Content_Management_System SHALL remove the chapter and all associated lessons
5. THE Content_Management_System SHALL enforce that only the formation owner or ADMIN can modify chapters
6. WHEN chapters are displayed, THE Content_Management_System SHALL order them by position in ascending order

### Requirement 2: Lesson Management

**User Story:** As a formateur, I want to create lessons within chapters, so that I can deliver specific learning content to apprenants.

#### Acceptance Criteria

1. WHEN a formateur creates a lesson, THE Content_Management_System SHALL associate it with a specific chapter
2. THE Content_Management_System SHALL store lesson title, description, and order position
3. WHEN a formateur updates a lesson, THE Content_Management_System SHALL persist the changes
4. WHEN a formateur deletes a lesson, THE Content_Management_System SHALL remove the lesson and all associated content items
5. THE Content_Management_System SHALL enforce that only the formation owner or ADMIN can modify lessons
6. WHEN lessons are displayed, THE Content_Management_System SHALL order them by position within their chapter

### Requirement 3: Video Content Management

**User Story:** As a formateur, I want to attach video content to lessons, so that apprenants can watch instructional videos.

#### Acceptance Criteria

1. WHEN a formateur adds a video to a lesson, THE Content_Management_System SHALL store the video URL and title
2. THE Content_Management_System SHALL validate that the video URL is accessible
3. WHEN a formateur updates video content, THE Content_Management_System SHALL persist the changes
4. WHEN a formateur deletes video content, THE Content_Management_System SHALL remove it from the lesson
5. THE Content_Management_System SHALL support multiple videos per lesson
6. THE Content_Management_System SHALL store video duration if provided

### Requirement 4: PDF Content Management

**User Story:** As a formateur, I want to attach PDF documents to lessons, so that apprenants can download and study reference materials.

#### Acceptance Criteria

1. WHEN a formateur uploads a PDF to a lesson, THE Content_Management_System SHALL store the file and generate a unique identifier
2. THE Content_Management_System SHALL validate that uploaded files are valid PDF format
3. THE Content_Management_System SHALL enforce a maximum file size of 10MB per PDF
4. WHEN a formateur deletes a PDF, THE Content_Management_System SHALL remove the file from storage
5. THE Content_Management_System SHALL support multiple PDFs per lesson
6. WHEN an apprenant requests a PDF, THE Content_Management_System SHALL provide a download URL

### Requirement 5: Content Hierarchy and Navigation

**User Story:** As a formateur, I want to view the complete content structure of my formation, so that I can understand and manage the learning path.

#### Acceptance Criteria

1. WHEN a formateur views a formation, THE Learning_Interface SHALL display all chapters in order
2. WHEN a formateur expands a chapter, THE Learning_Interface SHALL display all lessons within that chapter in order
3. WHEN a formateur selects a lesson, THE Learning_Interface SHALL display all content items for that lesson
4. THE Learning_Interface SHALL provide visual indicators for chapters, lessons, and content types
5. THE Learning_Interface SHALL allow drag-and-drop reordering of chapters and lessons
6. WHEN a formateur reorders content, THE Content_Management_System SHALL update position values accordingly

### Requirement 6: Access Control and Permissions

**User Story:** As a formateur, I want to ensure only authorized users can modify my course content, so that my formations remain secure and accurate.

#### Acceptance Criteria

1. WHEN a user attempts to create content, THE Content_Management_System SHALL verify the user has FORMATEUR or ADMIN role
2. WHEN a formateur attempts to modify content, THE Content_Management_System SHALL verify they own the formation or have ADMIN role
3. IF an unauthorized user attempts to modify content, THEN THE Content_Management_System SHALL return an authentication error
4. WHEN a user requests formation basic information (title, description, image, price), THE Content_Management_System SHALL allow all authenticated users to view published formations
5. WHEN a user requests formation content (chapters, lessons, videos, PDFs), THE Content_Management_System SHALL verify the user is enrolled in a session of that formation OR is the formation owner OR has ADMIN role
6. IF a user is not enrolled and attempts to access formation content, THEN THE Content_Management_System SHALL return an access denied error with message "Enroll to access this content"
7. WHERE a formation is unpublished, THE Content_Management_System SHALL restrict all viewing to the owner and ADMIN users

### Requirement 7: Content Validation and Integrity

**User Story:** As a formateur, I want the system to validate my content, so that I can ensure quality and completeness before publishing.

#### Acceptance Criteria

1. WHEN a formateur creates a chapter, THE Content_Management_System SHALL require a non-empty title
2. WHEN a formateur creates a lesson, THE Content_Management_System SHALL require a non-empty title
3. THE Content_Management_System SHALL prevent duplicate position values within the same parent container
4. WHEN a formateur deletes a chapter, THE Content_Management_System SHALL require confirmation if lessons exist
5. THE Content_Management_System SHALL validate that video URLs follow standard URL format
6. THE Content_Management_System SHALL validate PDF file integrity before storage

### Requirement 8: Formateur Dashboard Access

**User Story:** As a formateur, I want to access the same dashboard as learners when I log in, so that I have a consistent user experience across the platform.

#### Acceptance Criteria

1. WHEN a user with FORMATEUR role logs in, THE system SHALL redirect them to `/dashboard`
2. THE dashboard SHALL display the same interface for both FORMATEUR and APPRENANT roles
3. THE dashboard SHALL show personalized statistics based on user role (courses enrolled for APPRENANT, courses created for FORMATEUR)
4. THE system SHALL allow FORMATEUR to access all learner features (browse courses, enroll, watch content)
5. THE dashboard SHALL provide role-specific navigation options in the sidebar
6. WHEN a formateur views their profile, THE system SHALL display their role as "Formateur"

### Requirement 9: Role-Based Learning Menu

**User Story:** As a formateur, I want to see different options in the Learning menu compared to learners, so that I can access formation and session management tools.

#### Acceptance Criteria

1. WHEN a formateur clicks the Learning button in the sidebar, THE system SHALL display formateur-specific submenu items
2. THE Learning submenu for FORMATEUR SHALL include:
   - "My Formations" (route: `/learning/instructor/formations`)
   - "Manage Content" (route: `/learning/instructor/content`)
   - "My Sessions" (route: `/learning/instructor/sessions`)
   - "My Students" (route: `/learning/instructor/students`)
3. THE Learning submenu for APPRENANT SHALL include:
   - "Browse Courses" (route: `/learning/browse`)
   - "My Courses" (route: `/learning/my-courses`)
   - "Wishlist" (route: `/learning/wishlist`)
4. THE sidebar component SHALL use AuthService.userRole$ to determine which submenu items to display
5. WHEN a formateur navigates to a Learning route, THE system SHALL verify FORMATEUR role using RoleGuard
6. THE system SHALL allow FORMATEUR to also access learner routes (they can browse and enroll in other courses)
7. WHEN the user role changes, THE sidebar SHALL automatically update the Learning submenu items

### Requirement 10: Content Item Ordering and Display

**User Story:** As a formateur, I want to control the order of content items within lessons, so that apprenants experience content in the intended sequence.

#### Acceptance Criteria

1. WHEN a formateur adds a content item, THE Content_Management_System SHALL assign it the next available position
2. THE Content_Management_System SHALL allow reordering of content items within a lesson
3. WHEN content items are displayed, THE Content_Management_System SHALL order them by position in ascending order
4. THE Content_Management_System SHALL support mixed ordering of videos and PDFs
5. WHEN a formateur deletes a content item, THE Content_Management_System SHALL adjust remaining positions to maintain sequence
6. THE Content_Management_System SHALL preserve content type information (VIDEO or PDF) with each item

### Requirement 11: Bulk Operations and Efficiency

**User Story:** As a formateur, I want to perform bulk operations on content, so that I can efficiently manage large formations.

#### Acceptance Criteria

1. WHEN a formateur duplicates a chapter, THE Content_Management_System SHALL copy all lessons and content items
2. THE Content_Management_System SHALL allow moving lessons between chapters
3. WHEN a formateur moves a lesson, THE Content_Management_System SHALL update chapter associations and reorder positions
4. THE Content_Management_System SHALL provide a preview before bulk delete operations
5. THE Content_Management_System SHALL complete bulk operations within 5 seconds for up to 50 items
6. IF a bulk operation fails, THEN THE Content_Management_System SHALL rollback all changes and report the error

