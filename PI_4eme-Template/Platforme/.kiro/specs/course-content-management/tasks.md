# Implementation Plan: Course Content Management System

## Overview

This implementation plan breaks down the course content management feature into incremental coding tasks. The system enables formateurs to create hierarchical course content (Formation → Chapters → Lessons → Content Items) with support for video URLs and PDF uploads. Implementation follows a bottom-up approach: database schema, backend entities/services, REST API, frontend services, and UI components.

## Tasks

- [ ] 1. Set up database schema and migrations
  - [ ] 1.1 Create chapters table with foreign key to courses
    - Create migration file for chapters table
    - Add unique constraint on (formation_id, position)
    - Add indexes for formation_id and position
    - _Requirements: 1.1, 1.6, 7.3_
  
  - [ ] 1.2 Create content_items table with foreign key to lessons
    - Create migration file for content_items table
    - Add ENUM type for content type (VIDEO, PDF)
    - Add unique constraint on (lesson_id, position)
    - Add indexes for lesson_id, position, and type
    - _Requirements: 3.1, 3.6, 7.3, 10.4_
  
  - [ ] 1.3 Migrate existing lessons table to support chapters
    - Add chapter_id, position, and description columns to lessons
    - Create default chapter for each existing formation
    - Migrate existing lessons to default chapters
    - Remove old course_id and order_index columns
    - _Requirements: 2.1, 2.2_

- [ ] 2. Implement backend entities and repositories
  - [ ] 2.1 Create Chapter entity with JPA annotations
    - Define Chapter entity with id, title, position, formation relationship
    - Add OneToMany relationship to lessons with cascade ALL and orphanRemoval
    - Add timestamps (createdAt, updatedAt)
    - _Requirements: 1.1, 1.2, 1.4, 1.6_
  
  - [ ] 2.2 Create ContentItem entity with JPA annotations
    - Define ContentItem entity with id, title, type, url, position
    - Add ManyToOne relationship to lesson
    - Add optional fields: durationSeconds, fileSizeBytes
    - Add timestamps (createdAt, updatedAt)
    - _Requirements: 3.1, 3.6, 4.1_
  
  - [ ] 2.3 Update Lesson entity to support chapters
    - Add ManyToOne relationship to chapter
    - Add position and description fields
    - Add OneToMany relationship to contentItems with cascade ALL
    - _Requirements: 2.1, 2.2_
  
  - [ ] 2.4 Create ChapterRepository interface
    - Extend JpaRepository with Chapter entity
    - Add custom query methods: findByFormationIdOrderByPositionAsc
    - Add method to find max position for a formation
    - _Requirements: 1.1, 1.6, 10.1_
  
  - [ ] 2.5 Create ContentItemRepository interface
    - Extend JpaRepository with ContentItem entity
    - Add custom query methods: findByLessonIdOrderByPositionAsc
    - Add method to find max position for a lesson
    - _Requirements: 3.1, 10.1, 10.3_

- [ ] 3. Implement file storage service
  - [ ] 3.1 Create FileStorageService for PDF management
    - Implement storePdfFile method with UUID-based naming
    - Implement deletePdfFile method with file system cleanup
    - Implement loadPdfFile method returning Resource
    - Add configuration property for storage path
    - _Requirements: 4.1, 4.4_
  
  - [ ] 3.2 Implement PDF validation logic
    - Add validatePdfFormat method checking file headers
    - Add file size validation (max 10MB)
    - Throw appropriate exceptions for invalid files
    - _Requirements: 4.2, 4.3, 7.6_
  
  - [ ]* 3.3 Write property test for PDF storage
    - **Property 11: PDF Upload and Unique Identifier**
    - **Validates: Requirements 4.1**
  
  - [ ]* 3.4 Write unit tests for FileStorageService
    - Test successful PDF storage and retrieval
    - Test file deletion
    - Test validation errors for invalid formats
    - Test file size limit enforcement
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 4. Implement backend services for chapters
  - [ ] 4.1 Create ChapterService with CRUD operations
    - Implement createChapter with automatic position assignment
    - Implement updateChapter with title modification
    - Implement deleteChapter with cascade deletion
    - Implement getFormationChapters returning ordered list
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6, 10.1_
  
  - [ ] 4.2 Add access control validation to ChapterService
    - Inject AccessControlService
    - Validate user is formation owner or ADMIN for all modifications
    - Throw UnauthorizedAccessException for unauthorized access
    - _Requirements: 1.5, 6.1, 6.2_
  
  - [ ] 4.3 Implement chapter reordering functionality
    - Add reorderChapters method accepting list of chapter IDs
    - Update positions in transaction
    - Validate all chapters belong to same formation
    - _Requirements: 5.6, 10.2_
  
  - [ ] 4.4 Implement chapter duplication functionality
    - Add duplicateChapter method with deep copy
    - Create new chapter with new lessons and content items
    - Preserve structure but assign new IDs
    - _Requirements: 11.1, 11.6_
  
  - [ ]* 4.5 Write property tests for ChapterService
    - **Property 1: Chapter-Formation Association**
    - **Property 2: Chapter Round-Trip Persistence**
    - **Property 3: Hierarchical Cascade Deletion**
    - **Property 7: Owner-Based Access Control**
    - **Property 26: Automatic Position Assignment**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 10.1**
  
  - [ ]* 4.6 Write unit tests for ChapterService
    - Test chapter creation with valid data
    - Test update operations
    - Test deletion with cascade
    - Test access control denials
    - Test reordering logic
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 5.6_

- [ ] 5. Implement backend services for lessons
  - [ ] 5.1 Update LessonService to support chapters
    - Modify createLesson to accept chapterId instead of courseId
    - Add automatic position assignment within chapter
    - Update updateLesson to support description field
    - Ensure deleteLesson handles content items cascade
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 10.1_
  
  - [ ] 5.2 Add lesson reordering within chapters
    - Implement reorderLessons method for chapter
    - Update positions in transaction
    - Validate all lessons belong to same chapter
    - _Requirements: 5.6, 10.2_
  
  - [ ] 5.3 Implement lesson movement between chapters
    - Add moveLesson method accepting target chapter ID
    - Adjust positions in both source and destination chapters
    - Update lesson's chapter association
    - _Requirements: 11.2, 11.3_
  
  - [ ]* 5.4 Write property tests for LessonService
    - **Property 5: Lesson-Chapter Association**
    - **Property 6: Lesson Round-Trip Persistence**
    - **Property 30: Lesson Movement Between Chapters**
    - **Validates: Requirements 2.1, 2.2, 2.3, 11.2, 11.3**
  
  - [ ]* 5.5 Write unit tests for LessonService
    - Test lesson creation within chapter
    - Test lesson updates
    - Test lesson reordering
    - Test lesson movement between chapters
    - _Requirements: 2.1, 2.2, 2.3, 5.6, 11.2_

- [ ] 6. Implement backend services for content items
  - [ ] 6.1 Create ContentItemService with video content support
    - Implement createVideoContent with URL validation
    - Add URL format validation (protocol, domain, path)
    - Support optional durationSeconds field
    - Assign automatic position within lesson
    - _Requirements: 3.1, 3.3, 3.6, 7.5, 10.1_
  
  - [ ] 6.2 Add PDF content support to ContentItemService
    - Implement createPdfContent accepting MultipartFile
    - Validate PDF format using FileStorageService
    - Store file and save path in ContentItem
    - Record file size in bytes
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [ ] 6.3 Implement content item CRUD operations
    - Add updateContentItem for title and metadata updates
    - Add deleteContentItem with file cleanup for PDFs
    - Add getLessonContent returning ordered list
    - _Requirements: 3.3, 3.4, 10.3_
  
  - [ ] 6.4 Implement content reordering and download URL generation
    - Add reorderContent method for lesson
    - Add generatePdfDownloadUrl method with access control
    - Support mixed ordering of videos and PDFs
    - _Requirements: 4.6, 5.6, 10.2, 10.4_
  
  - [ ]* 6.5 Write property tests for ContentItemService
    - **Property 8: Video Content Round-Trip Persistence**
    - **Property 9: Content Item Deletion**
    - **Property 10: Multiple Content Items Per Lesson**
    - **Property 14: PDF Download URL Generation**
    - **Property 27: Mixed Content Type Ordering**
    - **Validates: Requirements 3.1, 3.3, 3.4, 3.5, 3.6, 4.5, 4.6, 10.4**
  
  - [ ]* 6.6 Write unit tests for ContentItemService
    - Test video content creation with valid URLs
    - Test PDF content creation with file upload
    - Test content deletion (video and PDF)
    - Test reordering mixed content types
    - Test download URL generation
    - _Requirements: 3.1, 3.3, 3.4, 4.1, 4.6, 10.4_

- [ ] 7. Checkpoint - Ensure backend services pass all tests
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement backend REST API controllers
  - [ ] 8.1 Create ChapterController with REST endpoints
    - POST /api/formation/formations/{formationId}/chapters - create chapter
    - GET /api/formation/formations/{formationId}/chapters - list chapters
    - PUT /api/formation/chapters/{chapterId} - update chapter
    - DELETE /api/formation/chapters/{chapterId} - delete chapter
    - PUT /api/formation/formations/{formationId}/chapters/reorder - reorder chapters
    - POST /api/formation/chapters/{chapterId}/duplicate - duplicate chapter
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 5.6, 11.1_
  
  - [ ] 8.2 Create ContentItemController with REST endpoints
    - POST /api/formation/lessons/{lessonId}/content/video - create video content
    - POST /api/formation/lessons/{lessonId}/content/pdf - upload PDF content
    - GET /api/formation/lessons/{lessonId}/content - list content items
    - PUT /api/formation/content/{contentId} - update content item
    - DELETE /api/formation/content/{contentId} - delete content item
    - PUT /api/formation/lessons/{lessonId}/content/reorder - reorder content
    - GET /api/formation/content/{contentId}/download - download PDF
    - _Requirements: 3.1, 3.3, 3.4, 3.6, 4.1, 4.6, 5.6_
  
  - [ ] 8.3 Update LessonController to support chapters
    - POST /api/formation/chapters/{chapterId}/lessons - create lesson
    - GET /api/formation/chapters/{chapterId}/lessons - list lessons
    - PUT /api/formation/lessons/{lessonId} - update lesson
    - DELETE /api/formation/lessons/{lessonId} - delete lesson
    - PUT /api/formation/chapters/{chapterId}/lessons/reorder - reorder lessons
    - POST /api/formation/lessons/{lessonId}/move - move lesson to another chapter
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 5.6, 11.2_
  
  - [ ] 8.4 Create DTOs for request and response objects
    - ChapterRequest, ChapterResponse with validation annotations
    - ContentItemRequest, ContentItemResponse
    - LessonRequest, LessonResponse (update existing)
    - ReorderRequest for bulk position updates
    - _Requirements: 7.1, 7.2, 7.3, 7.5_
  
  - [ ] 8.5 Add global exception handler for content management errors
    - Handle ValidationException → 400 Bad Request
    - Handle UnauthorizedAccessException → 403 Forbidden
    - Handle NotFoundException → 404 Not Found
    - Handle FileStorageException → 500 Internal Server Error
    - Return consistent error response format
    - _Requirements: 7.1, 7.2, 7.5, 7.6_
  
  - [ ]* 8.6 Write integration tests for REST endpoints
    - Test all endpoints with MockMvc
    - Test request validation
    - Test response formatting
    - Test error handling
    - Test file upload and download
    - _Requirements: 1.1, 2.1, 3.1, 4.1_

- [ ] 9. Implement frontend models and services
  - [ ] 9.1 Create TypeScript models for content entities
    - Define Chapter interface with lessons array
    - Define ContentItem interface with type enum
    - Update Lesson interface to include chapterId and contentItems
    - Define ContentType enum (VIDEO, PDF)
    - _Requirements: 1.1, 2.1, 3.1, 3.6_
  
  - [ ] 9.2 Create ContentManagementService for API calls
    - Implement chapter CRUD methods (create, update, delete, list)
    - Implement lesson CRUD methods with chapter support
    - Implement content item CRUD methods (video and PDF)
    - Implement reordering methods for all levels
    - Add error handling with toast notifications
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 3.1, 3.3, 3.4, 5.6_
  
  - [ ] 9.3 Create FileUploadService for PDF uploads
    - Implement uploadPdf method with progress tracking
    - Add client-side validation (file type, size)
    - Implement retry logic with exponential backoff
    - Generate download URLs for PDFs
    - _Requirements: 4.1, 4.2, 4.3, 4.6_
  
  - [ ]* 9.4 Write property tests for frontend services
    - **Property 16: Position Update on Reordering**
    - **Property 4: Content Ordering Invariant**
    - **Validates: Requirements 5.6, 10.2, 10.3**
  
  - [ ]* 9.5 Write unit tests for frontend services
    - Test HTTP calls with HttpClientTestingModule
    - Test request formatting
    - Test response parsing
    - Test error handling
    - _Requirements: 1.1, 2.1, 3.1, 4.1_

- [ ] 10. Implement frontend content management components
  - [ ] 10.1 Create ContentManagementComponent (main container)
    - Display formation header with title
    - List all chapters with drag-and-drop support (Angular CDK)
    - Add "Add Chapter" button
    - Handle chapter reordering events
    - Refresh chapters after modifications
    - _Requirements: 1.1, 5.1, 5.6_
  
  - [ ] 10.2 Create ChapterEditorComponent (expandable chapter card)
    - Display chapter title with inline editing
    - Add expand/collapse functionality
    - Show lessons list when expanded
    - Add "Add Lesson" button
    - Add "Delete Chapter" button with confirmation
    - Support drag-and-drop for lessons
    - _Requirements: 1.2, 1.3, 1.4, 2.1, 5.6_
  
  - [ ] 10.3 Create LessonEditorComponent (expandable lesson card)
    - Display lesson title and description with inline editing
    - Add expand/collapse functionality
    - Show content items when expanded
    - Add "Add Video" and "Add PDF" buttons
    - Add "Delete Lesson" button with confirmation
    - Support drag-and-drop for content items
    - _Requirements: 2.2, 2.3, 2.4, 3.1, 4.1, 5.6_
  
  - [ ] 10.4 Create ContentItemEditorComponent (content item display)
    - Display content type icon (video or PDF)
    - Show title with inline editing
    - For videos: show URL and duration fields
    - For PDFs: show file size and download button
    - Add "Delete" button with confirmation
    - _Requirements: 3.1, 3.3, 3.4, 3.6, 4.6_
  
  - [ ] 10.5 Add form validation to all editor components
    - Validate non-empty titles
    - Validate URL format for videos
    - Validate file type and size for PDFs
    - Show validation errors inline
    - Disable save buttons when invalid
    - _Requirements: 7.1, 7.2, 7.5_
  
  - [ ]* 10.6 Write unit tests for content management components
    - Test component rendering
    - Test user interactions (click, drag-and-drop)
    - Test form validation
    - Test error display
    - _Requirements: 1.1, 2.1, 3.1, 5.6_

- [ ] 11. Implement enhanced sidebar with role-based Learning menu
  - [ ] 11.1 Update SidebarComponent to show role-based menu items
    - Add Learning section to sidebar
    - For FORMATEUR/ADMIN: show "My Formations", "Manage Content", "My Sessions", "My Students"
    - For APPRENANT: show "Browse Courses", "My Courses", "Wishlist"
    - Use AuthService to get current user role
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 9.1, 9.2, 9.3, 9.4_
  
  - [ ] 11.2 Add icons and styling for Learning menu items
    - Use appropriate icons for each menu item
    - Highlight active route
    - Add hover effects
    - _Requirements: 8.1, 9.1_

- [ ] 12. Implement routing for instructor content management
  - [ ] 12.1 Create routes for content management pages
    - /learning/instructor/formations - list formations
    - /learning/instructor/content/:formationId - manage content
    - Add route guards for FORMATEUR/ADMIN roles
    - _Requirements: 9.5, 9.6_
  
  - [ ] 12.2 Create FormateurGuard for route protection
    - Check user has FORMATEUR or ADMIN role
    - Redirect to unauthorized page if access denied
    - _Requirements: 9.5_
  
  - [ ]* 12.3 Write unit tests for route guards
    - Test access granted for FORMATEUR
    - Test access granted for ADMIN
    - Test access denied for APPRENANT
    - Test redirect behavior
    - _Requirements: 9.5_

- [ ] 13. Implement content hierarchy retrieval
  - [ ] 13.1 Add endpoint to retrieve complete formation content hierarchy
    - GET /api/formation/formations/{formationId}/content - return chapters with nested lessons and content items
    - Apply access control based on formation status and user role
    - Order all levels by position
    - _Requirements: 5.1, 5.2, 5.3, 6.4, 6.5_
  
  - [ ] 13.2 Create FormationContentResponse DTO with nested structure
    - Include chapters with lessons array
    - Include lessons with contentItems array
    - All ordered by position
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [ ]* 13.3 Write property tests for hierarchy retrieval
    - **Property 15: Formation Content Hierarchy Retrieval**
    - **Property 17: Published Content Access**
    - **Property 18: Unpublished Content Access Restriction**
    - **Validates: Requirements 5.1, 5.2, 5.3, 6.4, 6.5**

- [ ] 14. Implement validation and error handling
  - [ ] 14.1 Add comprehensive validation to all entities
    - Non-empty title validation for chapters and lessons
    - URL format validation for video content
    - PDF format validation for file uploads
    - File size validation (max 10MB)
    - _Requirements: 7.1, 7.2, 7.5, 7.6_
  
  - [ ]* 14.2 Write property tests for validation
    - **Property 12: PDF Format Validation**
    - **Property 19: Non-Empty Title Validation**
    - **Property 21: URL Format Validation**
    - **Property 22: PDF Integrity Validation**
    - **Validates: Requirements 7.1, 7.2, 7.5, 7.6**
  
  - [ ]* 14.3 Write unit tests for validation edge cases
    - Test empty and whitespace-only titles
    - Test invalid URL formats
    - Test non-PDF file uploads
    - Test oversized file uploads
    - _Requirements: 7.1, 7.2, 7.5, 7.6_

- [ ] 15. Implement position management and reordering
  - [ ] 15.1 Add automatic position assignment logic
    - Calculate next position (max + 1) when position not provided
    - Apply to chapters, lessons, and content items
    - _Requirements: 10.1_
  
  - [ ] 15.2 Implement position rebalancing after deletion
    - Adjust positions to maintain contiguous sequence
    - Apply to all hierarchy levels
    - _Requirements: 10.5_
  
  - [ ]* 15.3 Write property tests for position management
    - **Property 20: Unique Position Constraint**
    - **Property 28: Position Rebalancing After Deletion**
    - **Validates: Requirements 7.3, 10.5**
  
  - [ ]* 15.4 Write unit tests for position edge cases
    - Test position assignment for first item
    - Test position assignment with gaps
    - Test rebalancing after deletion
    - _Requirements: 10.1, 10.5_

- [ ] 16. Implement transaction management for bulk operations
  - [ ] 16.1 Add @Transactional annotations to service methods
    - Apply to all create, update, delete operations
    - Apply to bulk operations (reorder, duplicate, move)
    - Configure rollback on all exceptions
    - _Requirements: 11.6_
  
  - [ ]* 16.2 Write property test for transaction rollback
    - **Property 31: Transaction Rollback on Bulk Operation Failure**
    - **Validates: Requirements 11.6**
  
  - [ ]* 16.3 Write integration tests for transaction behavior
    - Test rollback on duplicate chapter failure
    - Test rollback on move lesson failure
    - Verify system state unchanged after rollback
    - _Requirements: 11.6_

- [ ] 17. Final checkpoint - Ensure all tests pass and integration works
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties across randomized inputs
- Unit tests validate specific examples and edge cases
- Backend uses Java/Spring Boot with jqwik for property tests
- Frontend uses TypeScript/Angular with fast-check for property tests
- File storage uses file system (configurable path) for PDFs
- All modifications require formation owner or ADMIN role
- Cascade deletion ensures referential integrity throughout hierarchy
