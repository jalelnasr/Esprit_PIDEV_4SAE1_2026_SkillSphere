# Requirements Document: FORMATEUR Management Dashboard

## Introduction

The FORMATEUR Management Dashboard is a comprehensive content creation and student management system for instructors on the learning platform. This dashboard enables instructors (FORMATEUR role) to create and manage formations, organize sessions, track student progress, and manage educational content. The system provides a role-specific interface that focuses on content creation and teaching activities, distinct from the learner-focused APPRENANT dashboard.

## Glossary

- **FORMATEUR**: An instructor user role responsible for creating and managing educational content
- **APPRENANT**: A learner user role who consumes educational content
- **Formation**: A complete educational course containing multiple lessons and resources
- **Session**: A scheduled instance of a formation with specific date, time, location, and capacity
- **Lesson**: An individual learning unit (chapter) within a formation
- **Lesson_Resource**: Educational materials attached to lessons (videos, PDFs, documents)
- **Enrollment**: A record linking an APPRENANT to a Session
- **Dashboard**: The main interface for role-specific features and data visualization
- **Content_Management_System**: The subsystem for creating and organizing lessons and resources
- **Progress_Tracker**: The subsystem that calculates and displays student completion metrics
- **Formation_Status**: The publication state of a formation (DRAFT or PUBLISHED)
- **Session_Status**: The lifecycle state of a session (PLANNED, IN_PROGRESS, COMPLETED, CANCELLED)

## Requirements

### Requirement 1: FORMATEUR Dashboard Access

**User Story:** As a FORMATEUR, I want to access a dedicated dashboard, so that I can manage my teaching activities without seeing learner-specific features.

#### Acceptance Criteria

1. WHEN a user with FORMATEUR role logs in, THE Authentication_System SHALL redirect them to the FORMATEUR dashboard
2. THE Dashboard SHALL display four main sections: My Formations, My Sessions, My Students, and Content Management
3. THE Dashboard SHALL NOT display subscription management, pricing pages, or course browsing as a consumer
4. THE Dashboard SHALL NOT display payment or checkout features
5. WHEN a FORMATEUR attempts to access APPRENANT-only routes, THE Route_Guard SHALL deny access and redirect to the FORMATEUR dashboard

### Requirement 2: View All Formations

**User Story:** As a FORMATEUR, I want to view all formations I have created, so that I can manage my educational content.

#### Acceptance Criteria

1. THE My_Formations_Section SHALL display all formations where the FORMATEUR is the creator
2. FOR EACH formation, THE Display SHALL show title, description, category, level, status, and thumbnail image
3. THE My_Formations_Section SHALL display statistics: number of lessons, enrolled students count, and average completion rate
4. THE My_Formations_Section SHALL provide filtering by status (DRAFT or PUBLISHED)
5. THE My_Formations_Section SHALL provide sorting by creation date, title, or enrollment count
6. WHEN no formations exist, THE My_Formations_Section SHALL display a message prompting the FORMATEUR to create their first formation

### Requirement 3: Create New Formation

**User Story:** As a FORMATEUR, I want to create new formations, so that I can offer educational content to students.

#### Acceptance Criteria

1. WHEN a FORMATEUR clicks "Create Formation", THE System SHALL display a formation creation form
2. THE Formation_Form SHALL require: title (max 200 characters), description (max 2000 characters), category, and level
3. THE Formation_Form SHALL allow optional fields: thumbnail image upload (max 5MB, formats: JPG, PNG, WebP)
4. WHEN a FORMATEUR submits a valid formation, THE Formation_Service SHALL create the formation with status DRAFT
5. THE Formation_Service SHALL associate the formation with the authenticated FORMATEUR as the creator
6. WHEN creation succeeds, THE System SHALL display a success notification and redirect to the formation details page
7. WHEN creation fails due to validation errors, THE System SHALL display specific error messages for each invalid field

### Requirement 4: Update Existing Formation

**User Story:** As a FORMATEUR, I want to update my formations, so that I can keep content accurate and current.

#### Acceptance Criteria

1. WHEN a FORMATEUR clicks "Edit" on a formation, THE System SHALL display a pre-filled formation edit form
2. THE Formation_Service SHALL verify that the authenticated FORMATEUR is the creator before allowing edits
3. THE Formation_Form SHALL allow modification of: title, description, category, level, status, and thumbnail
4. WHEN a FORMATEUR changes status from DRAFT to PUBLISHED, THE System SHALL validate that at least one lesson exists
5. WHEN a FORMATEUR submits valid updates, THE Formation_Service SHALL save the changes with a timestamp
6. WHEN update succeeds, THE System SHALL display a success notification and refresh the formation display
7. IF the authenticated FORMATEUR is not the creator, THEN THE Formation_Service SHALL return a 403 Forbidden error

### Requirement 5: Delete Formation

**User Story:** As a FORMATEUR, I want to delete formations I no longer need, so that I can maintain a clean content library.

#### Acceptance Criteria

1. WHEN a FORMATEUR clicks "Delete" on a formation, THE System SHALL display a confirmation dialog
2. THE Confirmation_Dialog SHALL warn if the formation has active enrollments
3. THE Formation_Service SHALL verify that the authenticated FORMATEUR is the creator before allowing deletion
4. WHEN a FORMATEUR confirms deletion, THE Formation_Service SHALL delete the formation and all associated lessons and resources
5. THE Formation_Service SHALL delete all sessions associated with the formation
6. WHEN deletion succeeds, THE System SHALL display a success notification and remove the formation from the list
7. IF the authenticated FORMATEUR is not the creator, THEN THE Formation_Service SHALL return a 403 Forbidden error

### Requirement 6: Manage Formation Content

**User Story:** As a FORMATEUR, I want to manage lessons and resources for my formations, so that I can structure educational content effectively.

#### Acceptance Criteria

1. WHEN a FORMATEUR clicks "Manage Content" on a formation, THE System SHALL navigate to the Content_Management_System
2. THE Content_Management_System SHALL display all lessons for the selected formation in order
3. THE Content_Management_System SHALL allow creating new lessons with: title, description, duration, and order
4. THE Content_Management_System SHALL allow editing existing lessons
5. THE Content_Management_System SHALL allow deleting lessons with confirmation
6. THE Content_Management_System SHALL allow reordering lessons via drag-and-drop or up/down buttons
7. THE Content_Management_System SHALL allow uploading resources (videos, PDFs, documents) to each lesson
8. THE Content_Management_System SHALL validate that only the formation creator can manage content

### Requirement 7: View All Sessions

**User Story:** As a FORMATEUR, I want to view all sessions for my formations, so that I can track scheduled teaching activities.

#### Acceptance Criteria

1. THE My_Sessions_Section SHALL display all sessions linked to formations created by the FORMATEUR
2. FOR EACH session, THE Display SHALL show: formation title, date, time, location, capacity, enrolled count, and status
3. THE My_Sessions_Section SHALL display sessions grouped by status: PLANNED, IN_PROGRESS, COMPLETED, CANCELLED
4. THE My_Sessions_Section SHALL provide filtering by formation, date range, or status
5. THE My_Sessions_Section SHALL provide sorting by date, formation, or enrollment count
6. WHEN no sessions exist, THE My_Sessions_Section SHALL display a message prompting the FORMATEUR to create their first session

### Requirement 8: Create New Session

**User Story:** As a FORMATEUR, I want to create sessions for my formations, so that I can schedule teaching activities.

#### Acceptance Criteria

1. WHEN a FORMATEUR clicks "Create Session", THE System SHALL display a session creation form
2. THE Session_Form SHALL require: formation selection (limited to FORMATEUR's formations), date, time, location, capacity, and timezone
3. THE Session_Form SHALL validate that date is not in the past
4. THE Session_Form SHALL validate that capacity is a positive integer between 1 and 1000
5. WHEN a FORMATEUR submits a valid session, THE Session_Service SHALL create the session with status PLANNED
6. WHEN creation succeeds, THE System SHALL display a success notification and add the session to the list
7. WHEN creation fails due to validation errors, THE System SHALL display specific error messages for each invalid field

### Requirement 9: Update Existing Session

**User Story:** As a FORMATEUR, I want to update session details, so that I can adjust scheduling and logistics.

#### Acceptance Criteria

1. WHEN a FORMATEUR clicks "Edit" on a session, THE System SHALL display a pre-filled session edit form
2. THE Session_Service SHALL verify that the session belongs to a formation created by the authenticated FORMATEUR
3. THE Session_Form SHALL allow modification of: date, time, location, capacity, timezone, and status
4. WHEN a FORMATEUR reduces capacity below current enrollment count, THE System SHALL display a warning
5. WHEN a FORMATEUR changes status to CANCELLED, THE System SHALL display a confirmation dialog
6. WHEN a FORMATEUR submits valid updates, THE Session_Service SHALL save the changes with a timestamp
7. IF the session does not belong to the FORMATEUR's formation, THEN THE Session_Service SHALL return a 403 Forbidden error

### Requirement 10: Delete Session

**User Story:** As a FORMATEUR, I want to delete sessions that are no longer needed, so that I can maintain accurate scheduling.

#### Acceptance Criteria

1. WHEN a FORMATEUR clicks "Delete" on a session, THE System SHALL display a confirmation dialog
2. THE Confirmation_Dialog SHALL warn if the session has enrolled students
3. THE Session_Service SHALL verify that the session belongs to a formation created by the authenticated FORMATEUR
4. WHEN a FORMATEUR confirms deletion, THE Session_Service SHALL delete the session and all associated enrollments
5. WHEN deletion succeeds, THE System SHALL display a success notification and remove the session from the list
6. IF the session does not belong to the FORMATEUR's formation, THEN THE Session_Service SHALL return a 403 Forbidden error

### Requirement 11: View Session Participants

**User Story:** As a FORMATEUR, I want to view students enrolled in my sessions, so that I can track attendance and engagement.

#### Acceptance Criteria

1. WHEN a FORMATEUR clicks "View Participants" on a session, THE System SHALL display a modal with enrolled students
2. THE Participants_Modal SHALL display for each student: name, email, enrollment date, and enrollment status
3. THE Participants_Modal SHALL display total enrolled count and remaining capacity
4. THE Participants_Modal SHALL allow exporting the participant list as CSV
5. THE Session_Service SHALL verify that the session belongs to a formation created by the authenticated FORMATEUR before returning participant data
6. IF the session does not belong to the FORMATEUR's formation, THEN THE Session_Service SHALL return a 403 Forbidden error

### Requirement 12: View All Students

**User Story:** As a FORMATEUR, I want to view all students enrolled in my formations, so that I can monitor overall engagement.

#### Acceptance Criteria

1. THE My_Students_Section SHALL display all students enrolled in sessions of formations created by the FORMATEUR
2. FOR EACH student, THE Display SHALL show: name, email, formation title, session date, enrollment date, and progress percentage
3. THE My_Students_Section SHALL provide filtering by formation, session, or enrollment status
4. THE My_Students_Section SHALL provide sorting by name, enrollment date, or progress percentage
5. THE My_Students_Section SHALL display aggregate statistics: total students, average progress, and completion rate
6. WHEN no students are enrolled, THE My_Students_Section SHALL display a message indicating no enrollments exist

### Requirement 13: Track Student Progress

**User Story:** As a FORMATEUR, I want to track student progress through my formations, so that I can identify students who need support.

#### Acceptance Criteria

1. WHEN a FORMATEUR views student details, THE Progress_Tracker SHALL display completed lessons and total lessons
2. THE Progress_Tracker SHALL calculate progress percentage as (completed lessons / total lessons) × 100
3. THE Progress_Tracker SHALL display a visual progress bar for each student
4. THE Progress_Tracker SHALL highlight students with less than 25% progress in red (at-risk)
5. THE Progress_Tracker SHALL highlight students with 25-75% progress in yellow (in-progress)
6. THE Progress_Tracker SHALL highlight students with more than 75% progress in green (on-track)
7. THE Progress_Tracker SHALL update progress in real-time when students complete lessons

### Requirement 14: Formation Statistics Dashboard

**User Story:** As a FORMATEUR, I want to see statistics about my formations, so that I can measure teaching effectiveness.

#### Acceptance Criteria

1. THE Statistics_Dashboard SHALL display total formations created by the FORMATEUR
2. THE Statistics_Dashboard SHALL display total sessions scheduled across all formations
3. THE Statistics_Dashboard SHALL display total students enrolled across all sessions
4. THE Statistics_Dashboard SHALL display average completion rate across all formations
5. THE Statistics_Dashboard SHALL display a chart showing enrollments over time (last 6 months)
6. THE Statistics_Dashboard SHALL display top 5 formations by enrollment count
7. THE Statistics_Dashboard SHALL update statistics when new enrollments or completions occur

### Requirement 15: Responsive Design

**User Story:** As a FORMATEUR, I want to access my dashboard on any device, so that I can manage content on the go.

#### Acceptance Criteria

1. THE Dashboard SHALL display correctly on desktop screens (1920×1080 and above)
2. THE Dashboard SHALL display correctly on tablet screens (768×1024)
3. THE Dashboard SHALL display correctly on mobile screens (375×667 and above)
4. WHEN screen width is less than 768px, THE Dashboard SHALL switch to mobile layout with stacked sections
5. WHEN screen width is less than 768px, THE Data_Tables SHALL enable horizontal scrolling
6. THE Dashboard SHALL maintain readability and usability across all supported screen sizes

### Requirement 16: Role-Based Access Control

**User Story:** As a system administrator, I want to ensure only FORMATEUR users can access instructor features, so that content security is maintained.

#### Acceptance Criteria

1. THE Backend_API SHALL validate that the authenticated user has FORMATEUR role before processing any instructor requests
2. THE Frontend_Route_Guard SHALL prevent navigation to FORMATEUR routes for users without FORMATEUR role
3. WHEN a non-FORMATEUR user attempts to access FORMATEUR endpoints, THE Backend_API SHALL return a 403 Forbidden error
4. THE Backend_API SHALL verify formation ownership before allowing edit or delete operations
5. THE Backend_API SHALL verify session ownership (via formation) before allowing edit or delete operations
6. THE Backend_API SHALL log all access control violations for security auditing

### Requirement 17: Upload Lesson Resources

**User Story:** As a FORMATEUR, I want to upload educational resources to lessons, so that students can access learning materials.

#### Acceptance Criteria

1. WHEN a FORMATEUR uploads a resource, THE System SHALL validate file type (video: MP4, WebM; documents: PDF, DOCX, PPTX)
2. THE System SHALL validate file size (videos: max 500MB, documents: max 50MB)
3. WHEN upload is valid, THE File_Service SHALL store the file and return a URL
4. THE Lesson_Resource_Service SHALL create a resource record linking the file to the lesson
5. THE Content_Management_System SHALL display uploaded resources with file name, type, size, and upload date
6. THE Content_Management_System SHALL allow deleting resources with confirmation
7. WHEN a resource is deleted, THE File_Service SHALL remove the file from storage

### Requirement 18: Reorder Lessons

**User Story:** As a FORMATEUR, I want to reorder lessons within a formation, so that I can structure content logically.

#### Acceptance Criteria

1. THE Content_Management_System SHALL display lessons in ascending order by their order field
2. WHEN a FORMATEUR drags a lesson to a new position, THE System SHALL update the order field for affected lessons
3. THE Content_Management_System SHALL provide up/down arrow buttons as an alternative to drag-and-drop
4. WHEN a FORMATEUR clicks "Move Up", THE System SHALL swap the order values of the current lesson and the previous lesson
5. WHEN a FORMATEUR clicks "Move Down", THE System SHALL swap the order values of the current lesson and the next lesson
6. THE System SHALL persist order changes immediately without requiring a save button
7. THE System SHALL maintain order consistency (no gaps or duplicates in order values)

### Requirement 19: Formation Status Management

**User Story:** As a FORMATEUR, I want to control when my formations are visible to students, so that I can publish content when ready.

#### Acceptance Criteria

1. WHEN a formation is created, THE System SHALL set status to DRAFT by default
2. WHILE a formation has status DRAFT, THE System SHALL hide it from student course browsing
3. WHEN a FORMATEUR changes status to PUBLISHED, THE System SHALL validate that at least one lesson exists
4. WHEN a FORMATEUR changes status to PUBLISHED, THE System SHALL make the formation visible in student course browsing
5. THE System SHALL allow changing status from PUBLISHED back to DRAFT
6. WHEN status changes to DRAFT, THE System SHALL hide the formation from new student enrollments but preserve existing enrollments
7. THE System SHALL display a status badge (DRAFT in gray, PUBLISHED in green) on formation cards

### Requirement 20: Session Capacity Management

**User Story:** As a FORMATEUR, I want to set and manage session capacity, so that I can control class sizes.

#### Acceptance Criteria

1. WHEN a FORMATEUR creates a session, THE System SHALL require a capacity value between 1 and 1000
2. THE Session_Display SHALL show enrolled count and remaining capacity (capacity - enrolled count)
3. WHEN enrolled count reaches capacity, THE Session_Display SHALL show "Full" status
4. WHEN enrolled count reaches capacity, THE Enrollment_Service SHALL prevent new enrollments
5. WHEN a FORMATEUR increases capacity, THE Enrollment_Service SHALL allow new enrollments up to the new limit
6. WHEN a FORMATEUR decreases capacity below current enrollment count, THE System SHALL display a warning but allow the change
7. THE System SHALL display a visual indicator (progress bar) showing capacity utilization percentage

### Requirement 21: Error Handling and Notifications

**User Story:** As a FORMATEUR, I want clear feedback on my actions, so that I understand what happened and can correct errors.

#### Acceptance Criteria

1. WHEN an operation succeeds, THE System SHALL display a success toast notification for 3 seconds
2. WHEN an operation fails due to validation errors, THE System SHALL display error messages next to the relevant form fields
3. WHEN an operation fails due to server errors, THE System SHALL display a user-friendly error toast notification
4. THE System SHALL log detailed error information to the browser console for debugging
5. WHEN network connectivity is lost, THE System SHALL display a warning message and disable form submissions
6. WHEN a session expires, THE System SHALL redirect to login and display a message explaining the timeout
7. THE System SHALL provide retry options for failed operations when appropriate

### Requirement 22: Data Validation

**User Story:** As a system administrator, I want all user inputs validated, so that data integrity is maintained.

#### Acceptance Criteria

1. THE Frontend_Forms SHALL validate required fields before submission
2. THE Frontend_Forms SHALL validate field lengths (title: max 200, description: max 2000)
3. THE Frontend_Forms SHALL validate numeric fields (capacity: positive integer, duration: positive number)
4. THE Frontend_Forms SHALL validate date fields (no past dates for new sessions)
5. THE Backend_API SHALL re-validate all inputs server-side before processing
6. WHEN validation fails, THE Backend_API SHALL return a 400 Bad Request with specific error details
7. THE Backend_API SHALL sanitize all text inputs to prevent XSS attacks

### Requirement 23: Performance Requirements

**User Story:** As a FORMATEUR, I want the dashboard to load quickly, so that I can work efficiently.

#### Acceptance Criteria

1. THE Dashboard SHALL load the initial view within 2 seconds on a standard broadband connection (10 Mbps)
2. THE Formation_List SHALL paginate results when more than 20 formations exist
3. THE Session_List SHALL paginate results when more than 50 sessions exist
4. THE Student_List SHALL paginate results when more than 100 students exist
5. THE System SHALL implement lazy loading for images (thumbnails load as they enter viewport)
6. THE System SHALL cache formation and session data for 5 minutes to reduce API calls
7. WHEN data is stale (older than 5 minutes), THE System SHALL refresh from the backend

### Requirement 24: Search and Filter Functionality

**User Story:** As a FORMATEUR, I want to search and filter my content, so that I can quickly find specific formations or sessions.

#### Acceptance Criteria

1. THE My_Formations_Section SHALL provide a search box that filters by title or description
2. THE My_Formations_Section SHALL provide dropdown filters for category, level, and status
3. THE My_Sessions_Section SHALL provide a search box that filters by formation title or location
4. THE My_Sessions_Section SHALL provide dropdown filters for status and date range
5. THE My_Students_Section SHALL provide a search box that filters by student name or email
6. THE System SHALL apply filters in real-time as the FORMATEUR types or selects options
7. THE System SHALL display a count of filtered results and allow clearing all filters with one click

### Requirement 25: Audit Logging

**User Story:** As a system administrator, I want to track FORMATEUR actions, so that I can monitor system usage and troubleshoot issues.

#### Acceptance Criteria

1. THE Backend_API SHALL log all formation create, update, and delete operations with timestamp and user ID
2. THE Backend_API SHALL log all session create, update, and delete operations with timestamp and user ID
3. THE Backend_API SHALL log all lesson and resource create, update, and delete operations with timestamp and user ID
4. THE Backend_API SHALL log all access control violations (403 errors) with attempted action and user ID
5. THE Audit_Log SHALL include request IP address and user agent for security analysis
6. THE Audit_Log SHALL be stored in a separate database table for long-term retention
7. THE Audit_Log SHALL be accessible only to users with ADMIN role

