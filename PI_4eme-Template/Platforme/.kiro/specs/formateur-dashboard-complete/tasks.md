# Implementation Plan: FORMATEUR Management Dashboard

## Overview

This implementation plan follows a 7-week phased approach to build a comprehensive instructor-facing dashboard system. The system enables FORMATEUR users to manage formations, schedule sessions, track student progress, and organize educational content. Implementation leverages existing Angular/Spring Boot infrastructure while adding new instructor-specific components and API endpoints.

## Tasks

- [-] 1. Core Infrastructure Setup (Week 1)
  - [x] 1.1 Create InstructorDashboardComponent with routing
    - Create `src/app/features/learning/pages/instructor/instructor-dashboard.component.ts`
    - Create `src/app/features/learning/pages/instructor/instructor-dashboard.component.html`
    - Create `src/app/features/learning/pages/instructor/instructor-dashboard.component.css`
    - Add route configuration for `/instructor/dashboard` with FORMATEUR guard
    - _Requirements: 1.1, 1.2, 1.5_

  - [x] 1.2 Create InstructorSessionsComponent with routing
    - Create `src/app/features/learning/pages/instructor/instructor-sessions.component.ts`
    - Create `src/app/features/learning/pages/instructor/instructor-sessions.component.html`
    - Create `src/app/features/learning/pages/instructor/instructor-sessions.component.css`
    - Add route configuration for `/instructor/sessions`
    - _Requirements: 7.1, 7.6_

  - [x] 1.3 Create InstructorStudentsComponent with routing
    - Create `src/app/features/learning/pages/instructor/instructor-students.component.ts`
    - Create `src/app/features/learning/pages/instructor/instructor-students.component.html`
    - Create `src/app/features/learning/pages/instructor/instructor-students.component.css`
    - Add route configuration for `/instructor/students`
    - _Requirements: 12.1, 12.6_

  - [ ] 1.4 Create FormationStatisticsComponent with routing
    - Create `src/app/features/learning/pages/instructor/formation-statistics.component.ts`
    - Create `src/app/features/learning/pages/instructor/formation-statistics.component.html`
    - Create `src/app/features/learning/pages/instructor/formation-statistics.component.css`
    - Add route configuration for `/instructor/statistics/:courseId`
    - _Requirements: 14.1, 14.7_

  - [ ] 1.5 Create StudentTrackingService
    - Create `src/app/core/services/student-tracking.service.ts`
    - Implement `getInstructorStudents(instructorId)` method
    - Implement `getStudentProgress(enrollmentId)` method
    - Implement `getStudentsByFormation(courseId)` method
    - Implement `exportStudentList(instructorId)` method
    - _Requirements: 12.1, 12.2, 13.1_

  - [ ] 1.6 Create StatisticsService
    - Create `src/app/core/services/statistics.service.ts`
    - Implement `getDashboardStatistics(instructorId)` method
    - Implement `getFormationStatistics(courseId)` method
    - Implement `getEnrollmentTrends(instructorId, months)` method
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

  - [ ] 1.7 Implement FORMATEUR route guard
    - Create or enhance route guard to check FORMATEUR role
    - Apply guard to all instructor routes
    - Implement redirect to dashboard on unauthorized access
    - _Requirements: 1.5, 16.2_

  - [ ] 1.8 Update authentication redirect logic
    - Modify login success handler to redirect FORMATEUR users to `/instructor/dashboard`
    - Ensure APPRENANT users redirect to learner dashboard
    - _Requirements: 1.1_

- [ ] 2. Formation Management Enhancement (Week 2)
  - [ ] 2.1 Enhance InstructorFormationsComponent with list view
    - Display formations with title, description, level, status, thumbnail
    - Show statistics cards: lesson count, enrollment count, completion rate
    - Implement status badge display (DRAFT gray, PUBLISHED green)
    - Add "Create Formation" button
    - Add "Edit", "Delete", "Manage Content" buttons for each formation
    - _Requirements: 2.1, 2.2, 2.3, 19.7_

  - [ ] 2.2 Implement formation filtering and sorting
    - Add status filter dropdown (All, DRAFT, PUBLISHED)
    - Add sort dropdown (Date, Title, Enrollment Count)
    - Implement client-side filtering logic
    - Implement client-side sorting logic
    - _Requirements: 2.4, 2.5, 24.1, 24.2_

  - [ ] 2.3 Create formation creation modal
    - Create modal component with reactive form
    - Add form fields: title, description, category, level, thumbnail upload
    - Implement form validation (title max 200, description max 2000)
    - Implement thumbnail upload with preview
    - Call FormationService.createCourse() on submit
    - Display success toast and refresh list on success
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6, 22.1, 22.2_

  - [ ]* 2.4 Write property test for formation creation
    - **Property 2: Formation Creation Sets Draft Status**
    - **Validates: Requirements 3.4, 19.1**

  - [ ] 2.5 Create formation edit modal
    - Create modal component with pre-filled reactive form
    - Reuse form fields from creation modal
    - Implement status change validation (DRAFT to PUBLISHED requires lessons)
    - Call FormationService.updateCourse() on submit
    - Display success toast and refresh list on success
    - _Requirements: 4.1, 4.3, 4.4, 4.6_

  - [ ]* 2.6 Write property test for formation ownership verification
    - **Property 1: Formation Ownership Verification**
    - **Validates: Requirements 4.2, 4.7**

  - [ ] 2.7 Create formation delete confirmation dialog
    - Create confirmation dialog component
    - Display warning if formation has active enrollments
    - Call FormationService.deleteCourse() on confirm
    - Display success toast and refresh list on success
    - _Requirements: 5.1, 5.2, 5.6_

  - [ ]* 2.8 Write property test for cascade delete
    - **Property 15: Cascade Delete Formations**
    - **Validates: Requirements 5.4, 5.5**

  - [ ] 2.9 Implement publish/unpublish actions
    - Add publish button for DRAFT formations
    - Add unpublish button for PUBLISHED formations
    - Validate at least one lesson exists before publishing
    - Call FormationService.publishFormation() or unpublishFormation()
    - Update status badge on success
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6_

  - [ ]* 2.10 Write property test for publish validation
    - **Property 3: Publish Requires Lessons**
    - **Validates: Requirements 4.4, 19.3**

  - [ ] 2.11 Add empty state display
    - Show message when no formations exist
    - Display "Create your first formation" prompt
    - _Requirements: 2.6_


- [ ] 3. Session Management Implementation (Week 3)
  - [ ] 3.1 Implement InstructorSessionsComponent list view
    - Display sessions with formation title, date, time, location, capacity, enrolled count, status
    - Group sessions by status (PLANNED, IN_PROGRESS, COMPLETED, CANCELLED)
    - Show capacity utilization progress bar
    - Add "Create Session" button
    - Add "Edit", "Delete", "View Participants" buttons for each session
    - _Requirements: 7.1, 7.2, 7.3, 20.2, 20.7_

  - [ ] 3.2 Implement session filtering and sorting
    - Add formation filter dropdown
    - Add status filter dropdown
    - Add date range filter
    - Add sort dropdown (Date, Formation, Enrollment Count)
    - Implement client-side filtering and sorting
    - _Requirements: 7.4, 7.5, 24.3, 24.4_

  - [ ] 3.3 Create session creation modal
    - Create modal component with reactive form
    - Add form fields: formation selection, date, time, location, capacity, timezone
    - Limit formation dropdown to instructor's formations
    - Implement validation (date not in past, capacity 1-1000)
    - Call SessionService.createSession() on submit
    - Display success toast and refresh list on success
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 22.4_

  - [ ]* 3.4 Write property test for session date validation
    - **Property 5: Session Date Validation**
    - **Validates: Requirements 8.3**

  - [ ]* 3.5 Write property test for session capacity bounds
    - **Property 6: Session Capacity Bounds**
    - **Validates: Requirements 8.4, 20.1**

  - [ ] 3.6 Create session edit modal
    - Create modal component with pre-filled reactive form
    - Reuse form fields from creation modal
    - Display warning if reducing capacity below enrolled count
    - Display confirmation if changing status to CANCELLED
    - Call SessionService.updateSession() on submit
    - Display success toast and refresh list on success
    - _Requirements: 9.1, 9.3, 9.4, 9.5, 9.6, 20.6_

  - [ ]* 3.7 Write property test for session ownership verification
    - **Property 4: Session Ownership Verification**
    - **Validates: Requirements 9.2, 9.7, 10.3, 10.6**

  - [ ] 3.8 Create session delete confirmation dialog
    - Create confirmation dialog component
    - Display warning if session has enrolled students
    - Call SessionService.deleteSession() on confirm
    - Display success toast and refresh list on success
    - _Requirements: 10.1, 10.2, 10.5_

  - [ ]* 3.9 Write property test for cascade delete sessions
    - **Property 16: Cascade Delete Sessions**
    - **Validates: Requirements 10.4**

  - [ ] 3.10 Create session participants modal
    - Create modal component to display enrolled students
    - Show student name, email, enrollment date, status
    - Display total enrolled count and remaining capacity
    - Add "Export CSV" button
    - Call SessionService.getSessionParticipants() on open
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [ ] 3.11 Implement CSV export functionality
    - Call SessionService.exportParticipants() on button click
    - Trigger file download with participant data
    - _Requirements: 11.4_

  - [ ] 3.12 Add empty state display
    - Show message when no sessions exist
    - Display "Create your first session" prompt
    - _Requirements: 7.6_

- [ ] 4. Checkpoint - Verify formation and session management
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 5. Student Tracking Implementation (Week 4)
  - [ ] 5.1 Implement InstructorStudentsComponent list view
    - Display students with name, email, formation title, session date, enrollment date, progress percentage
    - Show completed lessons / total lessons for each student
    - Display visual progress bar for each student
    - Implement color-coded progress indicators (red <25%, yellow 25-75%, green >75%)
    - Add aggregate statistics cards: total students, average progress, completion rate
    - _Requirements: 12.1, 12.2, 12.5, 13.3, 13.4, 13.5, 13.6_

  - [ ] 5.2 Implement student filtering and sorting
    - Add formation filter dropdown
    - Add session filter dropdown
    - Add enrollment status filter dropdown
    - Add progress range filter (At-risk, In-progress, On-track)
    - Add sort dropdown (Name, Enrollment Date, Progress)
    - Add search box for name/email
    - Implement client-side filtering and sorting
    - _Requirements: 12.3, 12.4, 24.5, 24.6_

  - [ ] 5.3 Create student progress detail view
    - Create expandable row or modal for detailed progress
    - Display lesson-by-lesson completion status
    - Show lesson title, completion status, completion date
    - Display last activity timestamp
    - Call StudentTrackingService.getStudentProgress() on expand
    - _Requirements: 13.1, 13.2_

  - [ ]* 5.4 Write property test for progress calculation
    - **Property 9: Progress Calculation Accuracy**
    - **Validates: Requirements 13.2**

  - [ ] 5.5 Implement CSV export for student list
    - Add "Export Students" button
    - Call StudentTrackingService.exportStudentList() on click
    - Trigger file download with student data
    - _Requirements: 12.2_

  - [ ] 5.6 Add empty state display
    - Show message when no students are enrolled
    - Display helpful message about enrollments
    - _Requirements: 12.6_

  - [ ] 5.7 Implement real-time progress updates
    - Set up polling or WebSocket connection for progress updates
    - Update progress bars when students complete lessons
    - _Requirements: 13.7_

- [ ] 6. Content Management Enhancement (Week 4 continued)
  - [ ] 6.1 Enhance ContentManagementComponent with drag-and-drop
    - Install Angular CDK if not already installed
    - Implement drag-and-drop for lesson reordering
    - Update lesson order indices on drop
    - Call LessonService to persist new order
    - _Requirements: 6.6, 18.1, 18.2_

  - [ ]* 6.2 Write property test for lesson reordering
    - **Property 22: Lesson Reordering Preserves Content**
    - **Validates: Requirements 18.6**

  - [ ]* 6.3 Write property test for lesson order consistency
    - **Property 10: Lesson Order Consistency**
    - **Validates: Requirements 18.7**

  - [ ] 6.4 Add up/down arrow buttons for lesson reordering
    - Add arrow buttons next to each lesson
    - Implement move up/down logic
    - Update order indices and persist changes
    - _Requirements: 18.3, 18.4, 18.5, 18.6_

  - [ ] 6.5 Implement file upload for resources
    - Add file upload input with drag-and-drop zone
    - Implement file type validation (MP4, WebM, PDF, DOCX, PPTX)
    - Implement file size validation (videos 500MB, documents 50MB)
    - Show upload progress indicator
    - Call LessonResourceService.uploadResource() on file select
    - Display uploaded resource in list
    - _Requirements: 17.1, 17.2, 17.3_

  - [ ]* 6.6 Write property test for resource file type validation
    - **Property 11: Resource File Type Validation**
    - **Validates: Requirements 17.1**

  - [ ]* 6.7 Write property test for resource file size validation
    - **Property 12: Resource File Size Validation**
    - **Validates: Requirements 17.2**

  - [ ] 6.8 Add resource preview functionality
    - Implement preview modal for PDFs (iframe)
    - Implement preview modal for videos (video player)
    - Add preview button next to each resource
    - _Requirements: 17.5_

  - [ ] 6.9 Implement bulk resource delete
    - Add checkboxes for resource selection
    - Add "Delete Selected" button
    - Show confirmation dialog with count
    - Delete selected resources on confirm
    - _Requirements: 17.6_

  - [ ] 6.10 Enhance validation and error handling
    - Improve form validation messages
    - Add inline error display for file uploads
    - Handle upload failures gracefully
    - _Requirements: 21.2, 21.3, 22.5, 22.6, 22.7_


- [ ] 7. Statistics and Analytics Implementation (Week 5)
  - [ ] 7.1 Implement InstructorDashboardComponent statistics cards
    - Create statistics cards for: total formations, total sessions, total students, average completion rate
    - Call StatisticsService.getDashboardStatistics() on component init
    - Display loading state while fetching data
    - Display statistics with appropriate icons and formatting
    - _Requirements: 14.1, 14.2, 14.3, 14.4_

  - [ ]* 7.2 Write property test for statistics calculation
    - **Property 19: Statistics Calculation Accuracy**
    - **Validates: Requirements 14.3**

  - [ ] 7.3 Implement enrollment trends chart
    - Install Chart.js library if not already installed
    - Create line chart component for enrollment trends
    - Call StatisticsService.getEnrollmentTrends(6) for last 6 months
    - Display enrollments and completions over time
    - Add chart legend and axis labels
    - _Requirements: 14.5_

  - [ ] 7.4 Implement top formations display
    - Create card component for top formations
    - Display top 5 formations by enrollment count
    - Show formation title, enrollment count, completion rate
    - Add link to formation statistics page
    - _Requirements: 14.6_

  - [ ] 7.5 Implement recent activity feed
    - Create activity feed component
    - Display recent enrollments with student name, formation, date
    - Limit to 10 most recent activities
    - Add "View All Students" link
    - _Requirements: 14.7_

  - [ ] 7.6 Implement FormationStatisticsComponent detailed view
    - Display formation title and overview statistics
    - Show total enrollments, active enrollments, completed enrollments
    - Display average completion rate and average progress percentage
    - Show total sessions count
    - _Requirements: 14.1, 14.2, 14.3, 14.4_

  - [ ] 7.7 Implement lesson completion rates chart
    - Create bar chart component for lesson completion rates
    - Call StatisticsService.getFormationStatistics() for lesson data
    - Display completion rate for each lesson
    - Sort lessons by order index
    - Add chart title and axis labels
    - _Requirements: 14.7_

  - [ ] 7.8 Implement statistics export functionality
    - Add "Export Statistics" button
    - Generate PDF report with charts and data
    - Trigger file download
    - _Requirements: 14.7_

  - [ ] 7.9 Implement statistics auto-refresh
    - Set up polling to refresh statistics every 5 minutes
    - Update charts and cards with new data
    - Show last updated timestamp
    - _Requirements: 14.7_

- [ ] 8. Checkpoint - Verify student tracking and statistics
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 9. Backend API Endpoints - Formation Management (Week 6)
  - [ ] 9.1 Implement GET /api/formation/instructors/{instructorId}/courses endpoint
    - Create method in CourseController
    - Verify authenticated user matches instructorId
    - Query courses where createdBy = instructorId
    - Calculate statistics for each course (lesson count, enrollment count, completion rate)
    - Return course list with statistics
    - _Requirements: 2.1, 2.2, 2.3, 16.1_

  - [ ] 9.2 Enhance POST /api/formation/courses endpoint
    - Verify user has FORMATEUR role
    - Validate request body (title, description, level, etc.)
    - Set createdBy to authenticated user ID
    - Set status to DRAFT by default
    - Create course entity and save to database
    - Log audit entry
    - Return created course with 201 status
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 16.1, 22.5, 25.1_

  - [ ] 9.3 Enhance PUT /api/formation/courses/{courseId} endpoint
    - Verify user has FORMATEUR role
    - Verify authenticated user is course creator (ownership check)
    - Validate request body
    - If changing status to PUBLISHED, verify at least one lesson exists
    - Update course entity and save to database
    - Log audit entry
    - Return updated course with 200 status
    - Return 403 if not creator
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.7, 16.4, 22.5, 25.1_

  - [ ]* 9.4 Write unit tests for formation ownership verification
    - Test successful update by creator
    - Test 403 error for non-creator
    - Test validation errors

  - [ ] 9.5 Enhance DELETE /api/formation/courses/{courseId} endpoint
    - Verify user has FORMATEUR role
    - Verify authenticated user is course creator
    - Delete course entity (cascade delete lessons, resources, sessions, enrollments)
    - Log audit entry
    - Return 204 No Content
    - Return 403 if not creator
    - _Requirements: 5.1, 5.3, 5.4, 5.5, 5.6, 5.7, 16.4, 25.1_

  - [ ] 9.6 Implement POST /api/formation/courses/{courseId}/publish endpoint
    - Verify user has FORMATEUR role
    - Verify authenticated user is course creator
    - Verify at least one lesson exists
    - Update course status to PUBLISHED
    - Log audit entry
    - Return updated course with 200 status
    - _Requirements: 19.3, 19.4, 16.4_

  - [ ] 9.7 Implement POST /api/formation/courses/{courseId}/unpublish endpoint
    - Verify user has FORMATEUR role
    - Verify authenticated user is course creator
    - Update course status to DRAFT
    - Log audit entry
    - Return updated course with 200 status
    - _Requirements: 19.5, 19.6, 16.4_

- [ ] 10. Backend API Endpoints - Session Management (Week 6 continued)
  - [ ] 10.1 Implement GET /api/formation/instructors/{instructorId}/sessions endpoint
    - Create method in SessionController
    - Verify authenticated user matches instructorId
    - Query sessions where courseId IN (instructor's courses)
    - Support query parameters: status, courseId, startDate, endDate
    - Return session list with course titles
    - _Requirements: 7.1, 7.2, 7.4, 16.1_

  - [ ] 10.2 Enhance POST /api/formation/courses/{courseId}/sessions endpoint
    - Verify user has FORMATEUR role
    - Verify authenticated user is course creator
    - Validate request body (startAt, endAt, capacity, timezone)
    - Validate startAt is not in past
    - Validate capacity is between 1 and 1000
    - Create session entity with status PLANNED
    - Log audit entry
    - Return created session with 201 status
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 16.5, 22.5, 25.2_

  - [ ] 10.3 Implement PUT /api/formation/sessions/{sessionId} endpoint
    - Verify user has FORMATEUR role
    - Verify session belongs to instructor's formation
    - Validate request body
    - If reducing capacity below enrolledCount, log warning but allow
    - Update session entity and save to database
    - Log audit entry
    - Return updated session with 200 status
    - Return 403 if not session owner
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.6, 9.7, 16.5, 22.5, 25.2_

  - [ ] 10.4 Implement DELETE /api/formation/sessions/{sessionId} endpoint
    - Verify user has FORMATEUR role
    - Verify session belongs to instructor's formation
    - Delete session entity (cascade delete enrollments)
    - Log audit entry
    - Return 204 No Content
    - Return 403 if not session owner
    - _Requirements: 10.1, 10.3, 10.4, 10.5, 10.6, 16.5, 25.2_

  - [ ] 10.5 Implement GET /api/formation/sessions/{sessionId}/participants endpoint
    - Verify user has FORMATEUR role
    - Verify session belongs to instructor's formation
    - Query enrollments for session
    - Join with user data to get names and emails
    - Return participant list
    - Return 403 if not session owner
    - _Requirements: 11.1, 11.2, 11.3, 11.5, 11.6, 16.5_

  - [ ] 10.6 Implement GET /api/formation/sessions/{sessionId}/participants/export endpoint
    - Verify user has FORMATEUR role
    - Verify session belongs to instructor's formation
    - Query enrollments for session
    - Generate CSV file with participant data
    - Return CSV file as download
    - _Requirements: 11.4, 16.5_


- [ ] 11. Backend API Endpoints - Student Tracking (Week 6 continued)
  - [ ] 11.1 Implement GET /api/formation/instructors/{instructorId}/students endpoint
    - Create StudentTrackingController
    - Verify authenticated user matches instructorId
    - Query enrollments where courseId IN (instructor's courses)
    - Join with user data, course data, session data
    - Calculate progress for each enrollment
    - Support query parameters: courseId, sessionId, status, minProgress, maxProgress
    - Return student enrollment list with progress data
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 16.1_

  - [ ] 11.2 Implement GET /api/formation/enrollments/{enrollmentId}/progress endpoint
    - Verify user has FORMATEUR role
    - Verify enrollment belongs to instructor's formation
    - Query lesson_progress for enrollment
    - Join with lesson data to get titles and order
    - Calculate progress percentage
    - Return detailed progress data
    - Return 403 if not enrollment owner
    - _Requirements: 13.1, 13.2, 16.5_

  - [ ] 11.3 Implement GET /api/formation/instructors/{instructorId}/students/export endpoint
    - Verify authenticated user matches instructorId
    - Query all enrollments for instructor's formations
    - Generate CSV file with student data and progress
    - Return CSV file as download
    - _Requirements: 12.2, 16.1_

- [ ] 12. Backend API Endpoints - Statistics (Week 6 continued)
  - [ ] 12.1 Implement GET /api/formation/instructors/{instructorId}/statistics/dashboard endpoint
    - Create StatisticsController
    - Verify authenticated user matches instructorId
    - Calculate total formations count
    - Calculate total sessions count
    - Calculate total unique students count
    - Calculate average completion rate across all formations
    - Query top 5 formations by enrollment count
    - Query recent 10 enrollments
    - Return dashboard statistics object
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 16.1_

  - [ ]* 12.2 Write unit tests for statistics calculations
    - Test total students calculation
    - Test average completion rate calculation
    - Test top formations ranking

  - [ ] 12.3 Implement GET /api/formation/courses/{courseId}/statistics endpoint
    - Verify user has FORMATEUR role
    - Verify authenticated user is course creator
    - Calculate total enrollments count
    - Calculate active enrollments count
    - Calculate completed enrollments count
    - Calculate average completion rate
    - Calculate average progress percentage
    - Calculate total sessions count
    - Calculate completion rate for each lesson
    - Return formation statistics object
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.7, 16.4_

  - [ ] 12.4 Implement GET /api/formation/instructors/{instructorId}/statistics/trends endpoint
    - Verify authenticated user matches instructorId
    - Query enrollments grouped by month for last N months
    - Query completions grouped by month for last N months
    - Support query parameter: months (default 6)
    - Return trend data array
    - _Requirements: 14.5, 16.1_

- [ ] 13. Backend API Endpoints - Content Management (Week 6 continued)
  - [ ] 13.1 Implement POST /api/formation/lessons/{lessonId}/resources/upload endpoint
    - Create FileUploadController method
    - Verify user has FORMATEUR role
    - Verify lesson belongs to instructor's formation
    - Validate file type (MP4, WebM, PDF, DOCX, PPTX)
    - Validate file size (videos 500MB, documents 50MB)
    - Store file in organized directory structure
    - Create lesson_resource entity with file URL
    - Log audit entry
    - Return resource object with 201 status
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 16.5, 25.3_

  - [ ] 13.2 Implement PUT /api/formation/courses/{courseId}/lessons/reorder endpoint
    - Verify user has FORMATEUR role
    - Verify authenticated user is course creator
    - Validate lessonIds array contains all course lessons
    - Update order_index for each lesson
    - Log audit entry
    - Return 200 OK
    - _Requirements: 18.1, 18.2, 18.6, 18.7, 16.4, 25.3_

  - [ ] 13.3 Enhance DELETE /api/formation/lessons/{lessonId}/resources/{resourceId} endpoint
    - Verify user has FORMATEUR role
    - Verify resource belongs to instructor's formation
    - Delete resource entity from database
    - Delete file from storage
    - Log audit entry
    - Return 204 No Content
    - _Requirements: 17.6, 17.7, 16.5, 25.3_


- [ ] 14. Backend Security and Audit Logging (Week 6 continued)
  - [ ] 14.1 Create AuditLog entity and repository
    - Create AuditLog entity with fields: id, userId, userRole, action, entityType, entityId, ipAddress, userAgent, success, errorMessage, createdAt
    - Create AuditLogRepository interface
    - Create database migration for audit_logs table with indexes
    - _Requirements: 25.1, 25.2, 25.3, 25.6_

  - [ ] 14.2 Create AuditService for logging operations
    - Create AuditService with method logOperation(userId, action, entityType, entityId, success, error)
    - Extract IP address and user agent from request
    - Save audit log entry to database
    - _Requirements: 25.1, 25.2, 25.3, 25.5_

  - [ ] 14.3 Implement authorization middleware
    - Create @PreAuthorize annotations for FORMATEUR role
    - Create ownership verification methods in services
    - Log all authorization failures with AuditService
    - Return 403 Forbidden for authorization failures
    - _Requirements: 16.1, 16.3, 16.4, 16.5, 16.6, 25.4_

  - [ ]* 14.4 Write property test for role-based access control
    - **Property 13: Role-Based Access Control**
    - **Validates: Requirements 16.1, 16.3**

  - [ ]* 14.5 Write property test for audit logging completeness
    - **Property 14: Audit Logging Completeness**
    - **Validates: Requirements 25.1, 25.2, 25.3**

  - [ ] 14.4 Implement input sanitization
    - Create utility class for XSS prevention
    - Sanitize all text inputs before saving to database
    - Use parameterized queries for all database operations
    - _Requirements: 22.7_

  - [ ]* 14.5 Write property test for input validation consistency
    - **Property 17: Input Validation Consistency**
    - **Validates: Requirements 22.1, 22.2, 22.3, 22.4, 22.5**

  - [ ]* 14.6 Write property test for XSS prevention
    - **Property 18: XSS Prevention**
    - **Validates: Requirements 22.7**

- [ ] 15. Checkpoint - Verify backend API endpoints
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 16. Responsive Design and UI Polish (Week 7)
  - [ ] 16.1 Implement responsive layouts for all components
    - Add CSS media queries for breakpoints: 768px (tablet), 1024px (desktop)
    - Implement mobile-first design approach
    - Use CSS Grid and Flexbox for flexible layouts
    - Test on desktop (1920×1080), tablet (768×1024), mobile (375×667)
    - _Requirements: 15.1, 15.2, 15.3, 15.6_

  - [ ] 16.2 Implement mobile-specific UI adaptations
    - Switch to stacked sections for mobile layout
    - Enable horizontal scrolling for data tables
    - Adjust button sizes and spacing for touch targets
    - Optimize modal sizes for mobile screens
    - _Requirements: 15.4, 15.5_

  - [ ] 16.3 Implement toast notification system
    - Create toast service for displaying notifications
    - Implement success toasts (green, 3 seconds)
    - Implement error toasts (red, 5 seconds)
    - Implement warning toasts (yellow, 4 seconds)
    - Position toasts in top-right corner
    - _Requirements: 21.1, 21.3_

  - [ ] 16.4 Enhance form validation error display
    - Display inline error messages next to invalid fields
    - Show field-specific error messages
    - Highlight invalid fields with red border
    - Prevent form submission until validation passes
    - _Requirements: 21.2, 22.1, 22.2_

  - [ ] 16.5 Implement loading states
    - Add loading spinners for API calls
    - Disable buttons during operations
    - Show skeleton screens for initial data loads
    - Display progress bars for file uploads
    - _Requirements: 21.4, 23.1_

  - [ ] 16.6 Implement error handling for network issues
    - Display warning banner when network is unavailable
    - Disable form submissions during network issues
    - Show connection timeout messages
    - Provide retry buttons for failed operations
    - _Requirements: 21.5, 21.7_

  - [ ] 16.7 Implement session timeout handling
    - Detect 401 Unauthorized responses
    - Redirect to login page with timeout message
    - Clear authentication tokens
    - _Requirements: 21.6_

  - [ ] 16.8 Implement accessibility features
    - Use semantic HTML elements
    - Add ARIA labels for interactive elements
    - Ensure keyboard navigation works
    - Maintain sufficient color contrast (WCAG AA)
    - Add alt text for images
    - Test with screen reader
    - _Requirements: 15.6_

- [ ] 17. Performance Optimization (Week 7 continued)
  - [ ] 17.1 Implement pagination for all lists
    - Add pagination component to formation list (20 per page)
    - Add pagination component to session list (50 per page)
    - Add pagination component to student list (100 per page)
    - Implement page navigation controls
    - Display total count and current page
    - _Requirements: 23.2, 23.3, 23.4_

  - [ ]* 17.2 Write property test for pagination consistency
    - **Property 25: Pagination Consistency**
    - **Validates: Requirements 23.2, 23.3, 23.4**

  - [ ] 17.3 Implement lazy loading for images
    - Use Intersection Observer API for image loading
    - Load thumbnails as they enter viewport
    - Show placeholder while loading
    - _Requirements: 23.5_

  - [ ] 17.4 Implement data caching
    - Cache formation list for 5 minutes
    - Cache session list for 5 minutes
    - Cache statistics for 5 minutes
    - Display last updated timestamp
    - Provide manual refresh button
    - _Requirements: 23.6, 23.7_

  - [ ] 17.5 Implement OnPush change detection strategy
    - Update all components to use OnPush strategy
    - Use immutable data patterns
    - Optimize re-rendering performance
    - _Requirements: 23.1_

  - [ ] 17.6 Optimize API response times
    - Add database indexes for frequently queried fields
    - Optimize statistics calculation queries
    - Implement query result caching on backend
    - Test response times meet requirements (<2s dashboard, <1s lists, <3s statistics)
    - _Requirements: 23.1_


- [ ] 18. Search and Filter Implementation (Week 7 continued)
  - [ ] 18.1 Implement formation search and filters
    - Add search box for title/description filtering
    - Add category dropdown filter
    - Add level dropdown filter
    - Add status dropdown filter
    - Implement real-time filtering as user types
    - Display filtered result count
    - Add "Clear Filters" button
    - _Requirements: 24.1, 24.2, 24.6, 24.7_

  - [ ]* 18.2 Write property test for filter correctness
    - **Property 23: Filter Application Correctness**
    - **Validates: Requirements 2.4, 7.4, 12.3, 24.2, 24.4, 24.5**

  - [ ] 18.3 Implement session search and filters
    - Add search box for formation title/location filtering
    - Add status dropdown filter
    - Add date range filter (start date, end date)
    - Add formation dropdown filter
    - Implement real-time filtering
    - Display filtered result count
    - Add "Clear Filters" button
    - _Requirements: 24.3, 24.4, 24.6, 24.7_

  - [ ] 18.4 Implement student search and filters
    - Add search box for name/email filtering
    - Add formation dropdown filter
    - Add session dropdown filter
    - Add enrollment status dropdown filter
    - Add progress range filter (At-risk, In-progress, On-track)
    - Implement real-time filtering
    - Display filtered result count
    - Add "Clear Filters" button
    - _Requirements: 24.5, 24.6, 24.7_

  - [ ]* 18.5 Write property test for search functionality
    - **Property 24: Search Functionality Correctness**
    - **Validates: Requirements 24.1, 24.3, 24.5**

- [ ] 19. Integration Testing (Week 7 continued)
  - [ ]* 19.1 Write integration tests for formation CRUD flow
    - Test complete flow: create → edit → publish → unpublish → delete
    - Verify ownership checks at each step
    - Verify audit logging
    - Test with multiple users

  - [ ]* 19.2 Write integration tests for session management flow
    - Test complete flow: create → edit → view participants → delete
    - Verify capacity management
    - Verify enrollment count accuracy
    - Test CSV export

  - [ ]* 19.3 Write integration tests for student tracking flow
    - Test enrollment creation and progress tracking
    - Verify progress calculation accuracy
    - Test filtering and sorting
    - Test CSV export

  - [ ]* 19.4 Write integration tests for content management flow
    - Test lesson creation and reordering
    - Test resource upload and deletion
    - Verify file storage and retrieval
    - Test ownership verification

  - [ ]* 19.5 Write integration tests for statistics calculation
    - Test dashboard statistics accuracy
    - Test formation statistics accuracy
    - Test enrollment trends calculation
    - Verify real-time updates

  - [ ]* 19.6 Write integration tests for authorization
    - Test FORMATEUR role requirement
    - Test ownership verification for all operations
    - Test cross-user access prevention
    - Test audit logging for violations

- [ ] 20. Security Testing (Week 7 continued)
  - [ ]* 20.1 Test SQL injection prevention
    - Attempt SQL injection in search fields
    - Attempt SQL injection in filter parameters
    - Verify parameterized queries prevent attacks

  - [ ]* 20.2 Test XSS prevention
    - Attempt XSS in text inputs (title, description)
    - Verify input sanitization
    - Verify output encoding

  - [ ]* 20.3 Test file upload security
    - Attempt to upload malicious files
    - Test file type validation bypass attempts
    - Test file size limit enforcement
    - Verify file storage security

  - [ ]* 20.4 Test authorization bypass attempts
    - Attempt to access other instructors' formations
    - Attempt to modify other instructors' sessions
    - Attempt to access endpoints without FORMATEUR role
    - Verify all attempts are blocked and logged


- [ ] 21. Final Polish and Bug Fixes (Week 7 continued)
  - [ ] 21.1 Review and fix UI inconsistencies
    - Ensure consistent spacing and alignment
    - Verify color scheme consistency
    - Check button styles and hover states
    - Verify icon usage consistency
    - Test all modals and dialogs

  - [ ] 21.2 Review and improve error messages
    - Ensure all error messages are user-friendly
    - Verify error messages are specific and actionable
    - Check validation message clarity
    - Test all error scenarios

  - [ ] 21.3 Optimize bundle size
    - Analyze bundle size with webpack-bundle-analyzer
    - Implement lazy loading for routes
    - Remove unused dependencies
    - Optimize images and assets

  - [ ] 21.4 Cross-browser testing
    - Test on Chrome (latest 2 versions)
    - Test on Firefox (latest 2 versions)
    - Test on Safari (latest 2 versions)
    - Test on Edge (latest 2 versions)
    - Fix browser-specific issues

  - [ ] 21.5 Performance profiling
    - Profile component rendering performance
    - Identify and fix performance bottlenecks
    - Verify response time requirements are met
    - Test with large datasets (100+ formations, 500+ sessions, 1000+ students)

  - [ ] 21.6 Accessibility audit
    - Run automated accessibility tests
    - Test keyboard navigation
    - Test with screen reader
    - Fix accessibility issues
    - Verify WCAG AA compliance

  - [ ] 21.7 Code review and refactoring
    - Review all code for best practices
    - Refactor duplicated code
    - Improve code documentation
    - Ensure consistent code style

  - [ ] 21.8 Update documentation
    - Document API endpoints
    - Document component interfaces
    - Create user guide for FORMATEUR features
    - Document deployment procedures

- [ ] 22. Final Checkpoint - Complete system verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties from the design document
- Unit and integration tests validate specific functionality and edge cases
- The 7-week implementation plan allows for iterative development and testing
- Backend tasks use Java/Spring Boot, frontend tasks use TypeScript/Angular
- All authorization checks must verify FORMATEUR role and ownership before allowing operations
- All data modification operations must be logged to the audit trail
- Performance requirements must be validated with realistic data volumes
- Security testing is critical and should not be skipped

## Implementation Strategy

1. Start with core infrastructure to establish routing and services
2. Build formation management first as it's the foundation for other features
3. Add session management which depends on formations
4. Implement student tracking which depends on enrollments
5. Add statistics and analytics which aggregate data from all areas
6. Build backend API endpoints to support frontend features
7. Polish UI, optimize performance, and conduct thorough testing

## Success Criteria

- All 25 requirements are implemented and validated
- All correctness properties are tested with property-based tests
- Authorization and security measures are in place and tested
- Performance requirements are met (dashboard <2s, lists <1s, statistics <3s)
- Responsive design works on desktop, tablet, and mobile
- Audit logging captures all data modifications
- Code is well-documented and follows best practices
