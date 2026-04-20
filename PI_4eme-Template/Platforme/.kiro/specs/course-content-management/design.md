# Design Document: Course Content Management System

## Overview

The course content management system enables formateurs (instructors) to create, organize, and manage educational content within their formations (courses). The system implements a three-level hierarchy: Formation → Chapters → Lessons → Content Items, where content items can be videos (URL-based) or PDFs (file uploads).

This design extends the existing Formation_service microservice with new entities (Chapter, ContentItem) while leveraging existing Lesson entities. The system enforces role-based access control, ensuring only formation owners and administrators can modify content, while all authenticated users can view published content.

Key design principles:
- Hierarchical content organization with clear parent-child relationships
- Position-based ordering at each level (chapters, lessons, content items)
- Cascade deletion to maintain referential integrity
- Role-based access control integrated with existing JWT authentication
- File storage abstraction for PDF management
- RESTful API design following existing service patterns

## Architecture

### System Components

The system consists of three main layers:

**Backend Layer (Spring Boot)**
- New entities: Chapter, ContentItem (extends existing Course, Lesson)
- New repositories: ChapterRepository, ContentItemRepository
- New services: ChapterService, ContentItemService, FileStorageService
- New controllers: ChapterController, ContentItemController
- Enhanced AccessControlService for content permissions and enrollment checking

**Frontend Layer (Angular)**
- New components: ContentManagementComponent, ChapterEditorComponent, LessonEditorComponent, ContentItemEditorComponent
- Enhanced sidebar component with role-based Learning menu
- New services: ContentManagementService, FileUploadService
- Drag-and-drop reordering functionality

**Storage Layer**
- MySQL database for structured data (chapters, lessons, content items)
- File system storage for PDF files (configurable path)
- URL storage for video content (external hosting)

### Data Flow

1. **Content Creation Flow**
   - Formateur authenticates → JWT token with FORMATEUR role
   - Frontend validates user owns formation or has ADMIN role
   - Backend verifies ownership via AccessControlService
   - Entity created with auto-assigned position
   - Response returned with created entity

2. **Content Retrieval Flow**
   - User requests formation content
   - Backend checks if formation is published
   - If published, backend verifies user is enrolled in a session OR is formation owner OR has ADMIN role
   - If not enrolled and not owner/admin, return 403 Forbidden with "Enroll to access this content"
   - If unpublished, verify user is owner or ADMIN
   - Return hierarchical structure: chapters → lessons → content items
   - All ordered by position field

3. **File Upload Flow (PDFs)**
   - Frontend validates file type and size (max 10MB)
   - File uploaded to FileUploadController
   - Backend validates PDF format
   - File stored with unique identifier (UUID)
   - ContentItem created with file path reference
   - Download URL generated on retrieval

4. **Reordering Flow**
   - Frontend captures drag-and-drop event
   - New positions calculated for affected items
   - Batch update request sent to backend
   - Backend updates positions in transaction
   - Response confirms new order

### Integration Points

- **Existing Formation Service**: Extends Course entity relationship
- **User Service**: Validates user roles and ownership via JWT
- **File Upload Controller**: Reuses existing file upload infrastructure
- **Auth Service (Frontend)**: Provides role information for UI rendering

## Components and Interfaces

### Backend Components

#### 1. Chapter Entity

```java
@Entity
@Table(name = "chapters")
public class Chapter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(name = "position", nullable = false)
    private Integer position;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "formation_id", nullable = false)
    private Course formation;
    
    @OneToMany(mappedBy = "chapter", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC")
    private List<Lesson> lessons = new ArrayList<>();
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
```

**Design Rationale**: 
- Position field enables ordering without gaps
- Cascade ALL with orphanRemoval ensures lessons are deleted with chapter
- OrderBy annotation ensures consistent ordering in queries
- Timestamps track creation and modification

#### 2. ContentItem Entity

```java
@Entity
@Table(name = "content_items")
public class ContentItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ContentType type; // VIDEO or PDF
    
    @Column(nullable = false)
    private String url; // Video URL or file path for PDF
    
    @Column(name = "position", nullable = false)
    private Integer position;
    
    private Integer durationSeconds; // For videos
    
    private Long fileSizeBytes; // For PDFs
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
```

**Design Rationale**:
- Single table for both video and PDF content (discriminated by type)
- URL field serves dual purpose: external URL for videos, file path for PDFs
- Optional fields (durationSeconds, fileSizeBytes) support type-specific metadata
- Position enables mixed ordering of videos and PDFs

#### 3. Enhanced Lesson Entity

The existing Lesson entity requires modification to support chapters:

```java
@Entity
@Table(name = "lessons")
public class Lesson {
    // Existing fields...
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chapter_id", nullable = false)
    private Chapter chapter;
    
    @Column(name = "position", nullable = false)
    private Integer position;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @OneToMany(mappedBy = "lesson", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC")
    private List<ContentItem> contentItems = new ArrayList<>();
}
```

**Migration Strategy**: 
- Add chapter_id column (nullable initially)
- Create default chapter for existing lessons
- Update chapter_id for all lessons
- Make chapter_id non-nullable

#### 4. ChapterService

```java
@Service
public class ChapterService {
    
    Chapter createChapter(Long formationId, ChapterRequest request, Long userId);
    Chapter updateChapter(Long chapterId, ChapterRequest request, Long userId);
    void deleteChapter(Long chapterId, Long userId);
    List<Chapter> getFormationChapters(Long formationId);
    void reorderChapters(Long formationId, List<Long> chapterIds, Long userId);
    Chapter duplicateChapter(Long chapterId, Long userId);
}
```

**Key Responsibilities**:
- Validate user permissions via AccessControlService
- Manage chapter positions automatically
- Handle cascade deletion of lessons and content
- Support bulk operations (duplicate, reorder)

#### 5. Enhanced AccessControlService

```java
@Service
public class AccessControlService {
    
    boolean canModifyFormation(Long formationId, Long userId);
    boolean canViewFormationContent(Long formationId, Long userId);
    boolean isUserEnrolledInFormation(Long formationId, Long userId);
    boolean isFormationOwner(Long formationId, Long userId);
}
```

**Key Responsibilities**:
- Check if user owns formation
- Check if user has ADMIN role
- Check if user is enrolled in any session of the formation
- Combine checks for content access: enrolled OR owner OR admin

#### 6. ContentItemService

```java
@Service
public class ContentItemService {
    
    ContentItem createVideoContent(Long lessonId, VideoContentRequest request, Long userId);
    ContentItem createPdfContent(Long lessonId, MultipartFile file, String title, Long userId);
    ContentItem updateContentItem(Long contentId, ContentItemRequest request, Long userId);
    void deleteContentItem(Long contentId, Long userId);
    List<ContentItem> getLessonContent(Long lessonId);
    void reorderContent(Long lessonId, List<Long> contentIds, Long userId);
    String generatePdfDownloadUrl(Long contentId, Long userId);
}
```

**Key Responsibilities**:
- Validate file uploads (type, size)
- Coordinate with FileStorageService for PDF storage
- Validate video URLs
- Generate secure download URLs for PDFs
- Manage content item positions

#### 7. FileStorageService

```java
@Service
public class FileStorageService {
    
    String storePdfFile(MultipartFile file) throws IOException;
    void deletePdfFile(String filePath);
    Resource loadPdfFile(String filePath);
    boolean validatePdfFormat(MultipartFile file);
}
```

**Design Rationale**:
- Abstracts file system operations
- Generates unique file names (UUID-based)
- Validates PDF format before storage
- Supports future migration to cloud storage (S3, Azure Blob)

### Frontend Components

#### 1. ContentManagementComponent

Main component for managing formation content structure.

```typescript
@Component({
  selector: 'app-content-management',
  standalone: true,
  template: `
    <div class="content-management">
      <div class="formation-header">
        <h2>{{ formation?.title }}</h2>
        <button (click)="addChapter()">Add Chapter</button>
      </div>
      
      <div class="chapters-list" cdkDropList (cdkDropListDropped)="onChapterReorder($event)">
        <app-chapter-editor 
          *ngFor="let chapter of chapters"
          [chapter]="chapter"
          [formationId]="formationId"
          cdkDrag
          (chapterUpdated)="refreshChapters()"
          (chapterDeleted)="refreshChapters()">
        </app-chapter-editor>
      </div>
    </div>
  `
})
export class ContentManagementComponent {
  formationId: number;
  formation: Course;
  chapters: Chapter[];
  
  addChapter(): void;
  onChapterReorder(event: CdkDragDrop<Chapter[]>): void;
  refreshChapters(): void;
}
```

**Key Features**:
- Displays hierarchical content structure
- Drag-and-drop reordering using Angular CDK
- Lazy loading of lesson content
- Real-time updates after modifications

#### 2. ChapterEditorComponent

Manages individual chapter with expandable lesson list.

```typescript
@Component({
  selector: 'app-chapter-editor',
  standalone: true,
  template: `
    <div class="chapter-card">
      <div class="chapter-header">
        <input [(ngModel)]="chapter.title" (blur)="saveTitle()" />
        <button (click)="toggleExpanded()">{{ expanded ? 'Collapse' : 'Expand' }}</button>
        <button (click)="addLesson()">Add Lesson</button>
        <button (click)="deleteChapter()">Delete</button>
      </div>
      
      <div *ngIf="expanded" class="lessons-list" cdkDropList (cdkDropListDropped)="onLessonReorder($event)">
        <app-lesson-editor
          *ngFor="let lesson of chapter.lessons"
          [lesson]="lesson"
          [chapterId]="chapter.id"
          cdkDrag
          (lessonUpdated)="refreshLessons()"
          (lessonDeleted)="refreshLessons()">
        </app-lesson-editor>
      </div>
    </div>
  `
})
export class ChapterEditorComponent {
  @Input() chapter: Chapter;
  @Input() formationId: number;
  @Output() chapterUpdated = new EventEmitter<void>();
  @Output() chapterDeleted = new EventEmitter<void>();
  
  expanded: boolean = false;
  
  saveTitle(): void;
  addLesson(): void;
  deleteChapter(): void;
  onLessonReorder(event: CdkDragDrop<Lesson[]>): void;
}
```

#### 3. LessonEditorComponent

Manages individual lesson with content items.

```typescript
@Component({
  selector: 'app-lesson-editor',
  standalone: true,
  template: `
    <div class="lesson-card">
      <div class="lesson-header">
        <input [(ngModel)]="lesson.title" (blur)="saveTitle()" />
        <textarea [(ngModel)]="lesson.description" (blur)="saveDescription()"></textarea>
        <button (click)="toggleExpanded()">{{ expanded ? 'Collapse' : 'Expand' }}</button>
        <button (click)="deleteLesson()">Delete</button>
      </div>
      
      <div *ngIf="expanded" class="content-items">
        <div class="add-content-buttons">
          <button (click)="addVideo()">Add Video</button>
          <button (click)="addPdf()">Add PDF</button>
        </div>
        
        <div class="content-list" cdkDropList (cdkDropListDropped)="onContentReorder($event)">
          <app-content-item-editor
            *ngFor="let item of contentItems"
            [contentItem]="item"
            cdkDrag
            (contentUpdated)="refreshContent()"
            (contentDeleted)="refreshContent()">
          </app-content-item-editor>
        </div>
      </div>
    </div>
  `
})
export class LessonEditorComponent {
  @Input() lesson: Lesson;
  @Input() chapterId: number;
  @Output() lessonUpdated = new EventEmitter<void>();
  @Output() lessonDeleted = new EventEmitter<void>();
  
  expanded: boolean = false;
  contentItems: ContentItem[];
  
  addVideo(): void;
  addPdf(): void;
  deleteLesson(): void;
  onContentReorder(event: CdkDragDrop<ContentItem[]>): void;
}
```

#### 4. ContentItemEditorComponent

Displays and manages individual content items (video or PDF).

```typescript
@Component({
  selector: 'app-content-item-editor',
  standalone: true,
  template: `
    <div class="content-item" [class.video]="contentItem.type === 'VIDEO'" [class.pdf]="contentItem.type === 'PDF'">
      <div class="content-icon">
        <i [class]="contentItem.type === 'VIDEO' ? 'fas fa-video' : 'fas fa-file-pdf'"></i>
      </div>
      
      <div class="content-details">
        <input [(ngModel)]="contentItem.title" (blur)="saveTitle()" />
        
        <div *ngIf="contentItem.type === 'VIDEO'">
          <input [(ngModel)]="contentItem.url" (blur)="saveUrl()" placeholder="Video URL" />
          <input type="number" [(ngModel)]="contentItem.durationSeconds" (blur)="saveDuration()" placeholder="Duration (seconds)" />
        </div>
        
        <div *ngIf="contentItem.type === 'PDF'">
          <span>{{ contentItem.fileSizeBytes | fileSize }}</span>
          <button (click)="downloadPdf()">Download</button>
        </div>
      </div>
      
      <button (click)="deleteContent()">Delete</button>
    </div>
  `
})
export class ContentItemEditorComponent {
  @Input() contentItem: ContentItem;
  @Output() contentUpdated = new EventEmitter<void>();
  @Output() contentDeleted = new EventEmitter<void>();
  
  saveTitle(): void;
  saveUrl(): void;
  saveDuration(): void;
  downloadPdf(): void;
  deleteContent(): void;
}
```

#### 5. Enhanced Sidebar Component

Modified to show role-based Learning menu items.

```typescript
@Component({
  selector: 'app-sidebar',
  standalone: true
})
export class SidebarComponent {
  userRole$: Observable<string>;
  learningMenuItems$: Observable<MenuItem[]>;
  
  constructor(private authService: AuthService) {
    this.userRole$ = this.authService.userRole$;
    
    this.learningMenuItems$ = this.userRole$.pipe(
      map(role => {
        if (role === 'FORMATEUR' || role === 'ADMIN') {
          return [
            { label: 'My Formations', route: '/learning/instructor/formations', icon: 'book' },
            { label: 'Manage Content', route: '/learning/instructor/content', icon: 'edit' },
            { label: 'My Sessions', route: '/learning/instructor/sessions', icon: 'calendar' },
            { label: 'My Students', route: '/learning/instructor/students', icon: 'users' }
          ];
        } else {
          return [
            { label: 'Browse Courses', route: '/learning/browse', icon: 'search' },
            { label: 'My Courses', route: '/learning/my-courses', icon: 'book-open' },
            { label: 'Wishlist', route: '/learning/wishlist', icon: 'heart' }
          ];
        }
      })
    );
  }
}
```

### API Endpoints

#### Chapter Management

```
POST   /api/formation/formations/{formationId}/chapters
GET    /api/formation/formations/{formationId}/chapters
PUT    /api/formation/chapters/{chapterId}
DELETE /api/formation/chapters/{chapterId}
POST   /api/formation/chapters/{chapterId}/duplicate
PUT    /api/formation/formations/{formationId}/chapters/reorder
```

#### Lesson Management (Enhanced)

```
POST   /api/formation/chapters/{chapterId}/lessons
GET    /api/formation/chapters/{chapterId}/lessons
PUT    /api/formation/lessons/{lessonId}
DELETE /api/formation/lessons/{lessonId}
PUT    /api/formation/chapters/{chapterId}/lessons/reorder
POST   /api/formation/lessons/{lessonId}/move
```

#### Content Item Management

```
POST   /api/formation/lessons/{lessonId}/content/video
POST   /api/formation/lessons/{lessonId}/content/pdf
GET    /api/formation/lessons/{lessonId}/content
PUT    /api/formation/content/{contentId}
DELETE /api/formation/content/{contentId}
PUT    /api/formation/lessons/{lessonId}/content/reorder
GET    /api/formation/content/{contentId}/download
```

## Data Models

### Database Schema

#### chapters table

```sql
CREATE TABLE chapters (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    position INT NOT NULL,
    formation_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (formation_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_formation_position (formation_id, position),
    INDEX idx_formation_position (formation_id, position)
);
```

**Design Rationale**:
- Unique constraint on (formation_id, position) prevents duplicate positions
- Index on (formation_id, position) optimizes ordering queries
- Cascade delete ensures chapters are removed when formation is deleted

#### lessons table (modified)

```sql
ALTER TABLE lessons 
ADD COLUMN chapter_id BIGINT,
ADD COLUMN position INT,
ADD COLUMN description TEXT,
ADD FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
ADD UNIQUE KEY unique_chapter_position (chapter_id, position),
ADD INDEX idx_chapter_position (chapter_id, position);

-- Remove old course_id foreign key constraint
ALTER TABLE lessons DROP FOREIGN KEY lessons_ibfk_1;
ALTER TABLE lessons DROP COLUMN course_id;
ALTER TABLE lessons DROP COLUMN order_index;
```

**Migration Considerations**:
- Existing lessons need to be migrated to default chapters
- Position values need to be calculated from old order_index
- Backward compatibility maintained through migration script

#### content_items table

```sql
CREATE TABLE content_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    type ENUM('VIDEO', 'PDF') NOT NULL,
    url VARCHAR(1000) NOT NULL,
    position INT NOT NULL,
    duration_seconds INT,
    file_size_bytes BIGINT,
    lesson_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    UNIQUE KEY unique_lesson_position (lesson_id, position),
    INDEX idx_lesson_position (lesson_id, position),
    INDEX idx_type (type)
);
```

**Design Rationale**:
- ENUM type for content type ensures data integrity
- URL field sized for long URLs (1000 chars)
- Optional fields (duration_seconds, file_size_bytes) support type-specific data
- Unique constraint prevents position conflicts
- Type index optimizes filtering by content type

### DTOs (Data Transfer Objects)

#### ChapterRequest

```java
public class ChapterRequest {
    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;
    
    private Integer position; // Optional, auto-assigned if not provided
}
```

#### ChapterResponse

```java
public class ChapterResponse {
    private Long id;
    private String title;
    private Integer position;
    private Long formationId;
    private List<LessonSummary> lessons;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

#### ContentItemRequest

```java
public class ContentItemRequest {
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotNull(message = "Type is required")
    private ContentType type;
    
    private String url; // Required for VIDEO
    private Integer durationSeconds; // Optional for VIDEO
    private Integer position; // Optional, auto-assigned if not provided
}
```

#### ContentItemResponse

```java
public class ContentItemResponse {
    private Long id;
    private String title;
    private ContentType type;
    private String url; // Video URL or download URL for PDF
    private Integer position;
    private Integer durationSeconds;
    private Long fileSizeBytes;
    private Long lessonId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

### Frontend Models

```typescript
export interface Chapter {
  id: number;
  title: string;
  position: number;
  formationId: number;
  lessons?: Lesson[];
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: number;
  title: string;
  description?: string;
  position: number;
  chapterId: number;
  durationMinutes?: number;
  contentItems?: ContentItem[];
}

export interface ContentItem {
  id: number;
  title: string;
  type: 'VIDEO' | 'PDF';
  url: string;
  position: number;
  durationSeconds?: number;
  fileSizeBytes?: number;
  lessonId: number;
  createdAt: string;
  updatedAt: string;
}

export enum ContentType {
  VIDEO = 'VIDEO',
  PDF = 'PDF'
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified several areas of redundancy:

1. **Data Persistence Properties (1.2, 2.2, 3.1, 3.6, 10.6)**: These all test basic CRUD persistence. Combined into comprehensive round-trip properties.

2. **Update Persistence (1.3, 2.3, 3.3)**: All test the same pattern - create, update, retrieve. Combined into entity-specific round-trip properties.

3. **Access Control Properties (1.5, 2.5, 6.1, 6.2, 6.3)**: Multiple properties test ownership and role-based access. Combined into comprehensive access control properties.

4. **Ordering Properties (1.6, 2.6, 10.3)**: All test position-based ordering. Combined into a single ordering invariant property.

5. **Cascade Deletion (1.4, 2.4)**: Both test cascade deletion at different levels. Combined into hierarchical deletion property.

6. **Multiple Items Support (3.5, 4.5)**: Both test adding multiple content items. Combined into single property.

7. **Permission Inheritance (8.4, 9.6)**: Duplicate properties about formateur having apprenant permissions.

After reflection, 66 acceptance criteria reduce to 28 unique testable properties.

### Property 1: Chapter-Formation Association

*For any* formation and chapter, when a chapter is created for that formation, retrieving the chapter should show it associated with the correct formation ID.

**Validates: Requirements 1.1**

### Property 2: Chapter Round-Trip Persistence

*For any* chapter with title and position, creating the chapter then retrieving it should return a chapter with the same title and position values.

**Validates: Requirements 1.2, 1.3**

### Property 3: Hierarchical Cascade Deletion

*For any* chapter with lessons and content items, deleting the chapter should result in the chapter, all its lessons, and all content items being removed from the system.

**Validates: Requirements 1.4, 2.4**

### Property 4: Content Ordering Invariant

*For any* collection of chapters, lessons, or content items within their parent container, when retrieved, they should be ordered by position in ascending order.

**Validates: Requirements 1.6, 2.6, 10.3**

### Property 5: Lesson-Chapter Association

*For any* chapter and lesson, when a lesson is created for that chapter, retrieving the lesson should show it associated with the correct chapter ID.

**Validates: Requirements 2.1**

### Property 6: Lesson Round-Trip Persistence

*For any* lesson with title, description, and position, creating the lesson then retrieving it should return a lesson with the same title, description, and position values.

**Validates: Requirements 2.2, 2.3**

### Property 7: Owner-Based Access Control

*For any* content modification operation (create, update, delete) on chapters, lessons, or content items, the operation should succeed if and only if the user is the formation owner or has ADMIN role.

**Validates: Requirements 1.5, 2.5, 6.1, 6.2, 6.3**

### Property 8: Video Content Round-Trip Persistence

*For any* video content item with URL, title, and optional duration, creating the content item then retrieving it should return an item with the same URL, title, and duration values.

**Validates: Requirements 3.1, 3.3, 3.6**

### Property 9: Content Item Deletion

*For any* content item (video or PDF), after deleting the item, attempting to retrieve it should fail, and it should not appear in the lesson's content list.

**Validates: Requirements 3.4**

### Property 10: Multiple Content Items Per Lesson

*For any* lesson, adding multiple content items (videos and/or PDFs) should result in all items being retrievable and associated with that lesson.

**Validates: Requirements 3.5, 4.5**

### Property 11: PDF Upload and Unique Identifier

*For any* valid PDF file uploaded to a lesson, the system should store the file and generate a unique identifier that can be used to retrieve the file.

**Validates: Requirements 4.1**

### Property 12: PDF Format Validation

*For any* file that is not a valid PDF format, attempting to upload it as a PDF content item should be rejected with a validation error.

**Validates: Requirements 4.2**

### Property 13: PDF File and Record Deletion

*For any* PDF content item, deleting the item should remove both the database record and the physical file from storage.

**Validates: Requirements 4.4**

### Property 14: PDF Download URL Generation

*For any* PDF content item, requesting a download URL should return a valid URL that can be used to retrieve the file.

**Validates: Requirements 4.6**

### Property 15: Formation Content Hierarchy Retrieval

*For any* formation with chapters, lessons, and content items, retrieving the formation's content should return the complete hierarchy with all chapters containing their lessons, and all lessons containing their content items.

**Validates: Requirements 5.1, 5.2, 5.3**

### Property 16: Position Update on Reordering

*For any* collection of items (chapters, lessons, or content items) within a container, reordering the items should update their position values to reflect the new order.

**Validates: Requirements 5.6, 10.2**

### Property 17: Formation Preview Access

*For any* published formation, any authenticated user should be able to view the formation's basic information (title, description, image, price) regardless of enrollment status.

**Validates: Requirements 6.4**

### Property 18: Enrollment-Based Content Access

*For any* formation content request (chapters, lessons, videos, PDFs), the system should grant access if and only if the user is enrolled in a session of that formation OR is the formation owner OR has ADMIN role.

**Validates: Requirements 6.5**

### Property 19: Unpublished Content Access Restriction

*For any* unpublished formation, only the formation owner and users with ADMIN role should be able to view any formation information or content.

**Validates: Requirements 6.7**

### Property 20: Non-Empty Title Validation

*For any* chapter or lesson creation request with an empty or whitespace-only title, the system should reject the request with a validation error.

**Validates: Requirements 7.1, 7.2**

### Property 21: Unique Position Constraint

*For any* parent container (formation for chapters, chapter for lessons, lesson for content items), attempting to create two items with the same position should be rejected or automatically adjusted to maintain uniqueness.

**Validates: Requirements 7.3**

### Property 22: URL Format Validation

*For any* video content item, the URL should conform to standard URL format (protocol, domain, path), and invalid URLs should be rejected with a validation error.

**Validates: Requirements 7.5**

### Property 23: PDF Integrity Validation

*For any* file uploaded as a PDF, the system should validate the file's integrity (valid PDF structure), and corrupted files should be rejected.

**Validates: Requirements 7.6**

### Property 24: Role-Based Statistics

*For any* user viewing the dashboard, the statistics displayed should be appropriate for their role (courses created for FORMATEUR, courses enrolled for APPRENANT).

**Validates: Requirements 8.3**

### Property 25: Formateur Permission Inheritance

*For any* feature or route accessible to APPRENANT role, users with FORMATEUR role should also have access to that feature or route.

**Validates: Requirements 8.4, 9.6**

### Property 26: Route Guard Authorization

*For any* formateur-specific route, attempting to access the route without FORMATEUR or ADMIN role should be blocked by the route guard.

**Validates: Requirements 9.5**

### Property 27: Automatic Position Assignment

*For any* new item (chapter, lesson, or content item) created without an explicit position, the system should automatically assign it the next available position (max existing position + 1).

**Validates: Requirements 10.1**

### Property 28: Mixed Content Type Ordering

*For any* lesson containing both video and PDF content items, the items should be orderable in any sequence, with position determining order regardless of content type.

**Validates: Requirements 10.4**

### Property 29: Position Rebalancing After Deletion

*For any* collection of items with positions, after deleting an item, the remaining items' positions should be adjusted to maintain a contiguous sequence (no gaps).

**Validates: Requirements 10.5**

### Property 30: Chapter Duplication with Deep Copy

*For any* chapter with lessons and content items, duplicating the chapter should create a new chapter with new instances of all lessons and content items, preserving the structure but with new IDs.

**Validates: Requirements 11.1**

### Property 31: Lesson Movement Between Chapters

*For any* lesson, moving it from one chapter to another should update the lesson's chapter association and adjust positions in both the source and destination chapters.

**Validates: Requirements 11.2, 11.3**

### Property 32: Transaction Rollback on Bulk Operation Failure

*For any* bulk operation (duplicate chapter, move multiple lessons), if any part of the operation fails, all changes should be rolled back, leaving the system in its original state.

**Validates: Requirements 11.6**

### Edge Cases

The following edge cases should be handled by the property test generators:

- **Empty Content (4.3)**: PDF files at the 10MB limit should be accepted; files over 10MB should be rejected
- **Empty Formations**: Formations with no chapters should return empty lists
- **Single Item Collections**: Reordering, deletion, and position assignment should work correctly with single items
- **Concurrent Modifications**: Position conflicts from concurrent updates should be handled gracefully
- **Special Characters**: Titles with Unicode, emojis, and special characters should be preserved correctly
- **Long URLs**: Video URLs up to 1000 characters should be supported
- **File System Errors**: PDF storage failures should be handled with appropriate error messages

## Error Handling

### Error Categories

#### 1. Validation Errors (400 Bad Request)

- Empty or whitespace-only titles
- Invalid URL formats
- Invalid PDF file format
- File size exceeds 10MB limit
- Duplicate position values
- Missing required fields

**Response Format**:
```json
{
  "status": 400,
  "error": "Validation Error",
  "message": "Title cannot be empty",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/formation/chapters"
}
```

#### 2. Authorization Errors (403 Forbidden)

- User lacks required role (not FORMATEUR or ADMIN)
- User is not formation owner
- Attempting to view unpublished content without permission

**Response Format**:
```json
{
  "status": 403,
  "error": "Access Denied",
  "message": "You do not have permission to modify this formation",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/formation/chapters/123"
}
```

#### 3. Not Found Errors (404 Not Found)

- Chapter, lesson, or content item does not exist
- Formation does not exist
- PDF file not found in storage

**Response Format**:
```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Chapter with ID 123 not found",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/formation/chapters/123"
}
```

#### 4. Conflict Errors (409 Conflict)

- Duplicate position values (if not auto-resolved)
- Concurrent modification conflicts

**Response Format**:
```json
{
  "status": 409,
  "error": "Conflict",
  "message": "Position 1 is already occupied in this chapter",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/formation/chapters/123/lessons"
}
```

#### 5. Server Errors (500 Internal Server Error)

- File storage failures
- Database transaction failures
- Unexpected exceptions

**Response Format**:
```json
{
  "status": 500,
  "error": "Internal Server Error",
  "message": "Failed to store PDF file",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/formation/lessons/123/content/pdf"
}
```

### Error Handling Strategies

#### Backend Error Handling

1. **Service Layer**: Throw domain-specific exceptions (ChapterNotFoundException, UnauthorizedAccessException)
2. **Global Exception Handler**: Catch and transform exceptions into appropriate HTTP responses
3. **Transaction Management**: Use @Transactional with rollback on exceptions
4. **File Operations**: Wrap file I/O in try-catch, clean up on failure
5. **Validation**: Use Bean Validation annotations (@NotBlank, @Size) with automatic validation

#### Frontend Error Handling

1. **HTTP Interceptor**: Catch HTTP errors globally, show toast notifications
2. **Form Validation**: Validate inputs before submission (title length, file size)
3. **Optimistic Updates**: Update UI immediately, rollback on error
4. **Retry Logic**: Retry failed file uploads with exponential backoff
5. **User Feedback**: Show clear error messages with actionable guidance

### Logging Strategy

- **INFO**: Successful operations (chapter created, lesson updated)
- **WARN**: Validation failures, authorization denials
- **ERROR**: Server errors, file storage failures, database errors
- **DEBUG**: Detailed operation traces for troubleshooting

Log format: `[timestamp] [level] [user_id] [operation] [entity_type] [entity_id] [message]`

Example: `[2024-01-15 10:30:00] [INFO] [user:42] [CREATE] [Chapter] [id:123] [Chapter created for formation 5]`

## Testing Strategy

### Dual Testing Approach

This feature requires both unit testing and property-based testing to ensure comprehensive coverage:

- **Unit Tests**: Verify specific examples, edge cases, and error conditions
- **Property Tests**: Verify universal properties across all inputs through randomization

Both approaches are complementary and necessary. Unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across a wide range of inputs.

### Property-Based Testing

**Framework Selection**:
- **Backend (Java)**: jqwik library for property-based testing
- **Frontend (TypeScript)**: fast-check library for property-based testing

**Configuration**:
- Minimum 100 iterations per property test (due to randomization)
- Each property test must reference its design document property
- Tag format: `@Tag("Feature: course-content-management, Property {number}: {property_text}")`

**Property Test Structure** (Backend Example):

```java
@Property
@Tag("Feature: course-content-management, Property 2: Chapter Round-Trip Persistence")
void chapterRoundTripPersistence(
    @ForAll @StringLength(min = 1, max = 255) String title,
    @ForAll @IntRange(min = 0, max = 100) int position,
    @ForAll @LongRange(min = 1, max = 1000) long formationId
) {
    // Arrange: Create chapter
    ChapterRequest request = new ChapterRequest(title, position);
    Chapter created = chapterService.createChapter(formationId, request, ownerId);
    
    // Act: Retrieve chapter
    Chapter retrieved = chapterService.getChapter(created.getId());
    
    // Assert: Values match
    assertThat(retrieved.getTitle()).isEqualTo(title);
    assertThat(retrieved.getPosition()).isEqualTo(position);
    assertThat(retrieved.getFormationId()).isEqualTo(formationId);
}
```

**Property Test Structure** (Frontend Example):

```typescript
import fc from 'fast-check';

describe('Feature: course-content-management, Property 16: Position Update on Reordering', () => {
  it('should update positions when reordering chapters', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          id: fc.integer({ min: 1, max: 1000 }),
          title: fc.string({ minLength: 1, maxLength: 255 }),
          position: fc.integer({ min: 0, max: 100 })
        }), { minLength: 2, maxLength: 10 }),
        (chapters) => {
          // Arrange: Sort chapters by position
          const sorted = [...chapters].sort((a, b) => a.position - b.position);
          
          // Act: Reorder (reverse)
          const reordered = service.reorderChapters(sorted.reverse());
          
          // Assert: Positions updated correctly
          reordered.forEach((chapter, index) => {
            expect(chapter.position).toBe(index);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Unit Testing

**Backend Unit Tests** (JUnit 5 + Mockito):

1. **Repository Tests**: Test database queries and constraints
   - Unique position constraints
   - Cascade deletion
   - Ordering queries

2. **Service Tests**: Test business logic with mocked repositories
   - Access control validation
   - Position assignment
   - Error handling

3. **Controller Tests**: Test REST endpoints with MockMvc
   - Request validation
   - Response formatting
   - HTTP status codes

4. **Integration Tests**: Test complete flows with test database
   - File upload and download
   - Transaction rollback
   - Concurrent modifications

**Frontend Unit Tests** (Jasmine + Karma):

1. **Component Tests**: Test component behavior with mocked services
   - User interactions (click, drag-and-drop)
   - Form validation
   - Error display

2. **Service Tests**: Test HTTP calls with HttpClientTestingModule
   - Request formatting
   - Response parsing
   - Error handling

3. **Guard Tests**: Test route guards with mocked auth service
   - Role-based access
   - Redirect behavior

4. **Pipe Tests**: Test custom pipes (file size formatting)

### Test Coverage Goals

- **Backend**: 80% line coverage, 90% branch coverage
- **Frontend**: 75% line coverage, 85% branch coverage
- **Property Tests**: All 31 properties implemented
- **Edge Cases**: All identified edge cases covered

### Testing Best Practices

1. **Arrange-Act-Assert**: Structure all tests clearly
2. **Test Isolation**: Each test should be independent
3. **Meaningful Names**: Test names should describe what is being tested
4. **Mock External Dependencies**: Don't call real APIs or file systems in unit tests
5. **Test Data Builders**: Use builder pattern for creating test data
6. **Parameterized Tests**: Use @ParameterizedTest for multiple similar cases
7. **Test Fixtures**: Reuse common test setup with @BeforeEach
8. **Assertion Libraries**: Use AssertJ for fluent assertions

### Example Test Cases

**Unit Test Example** (Backend):

```java
@Test
void shouldRejectEmptyChapterTitle() {
    // Arrange
    ChapterRequest request = new ChapterRequest("   ", 1);
    
    // Act & Assert
    assertThatThrownBy(() -> 
        chapterService.createChapter(formationId, request, userId)
    )
    .isInstanceOf(ValidationException.class)
    .hasMessageContaining("Title cannot be empty");
}
```

**Unit Test Example** (Frontend):

```typescript
it('should display error when PDF exceeds 10MB', () => {
  // Arrange
  const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' });
  
  // Act
  component.onFileSelected({ target: { files: [largeFile] } });
  
  // Assert
  expect(component.errorMessage).toBe('File size must not exceed 10MB');
  expect(component.selectedFile).toBeNull();
});
```

### Continuous Integration

- Run all tests on every commit
- Fail build if coverage drops below threshold
- Run property tests with increased iterations (1000) in CI
- Generate coverage reports and publish to dashboard
- Run mutation testing to verify test quality

