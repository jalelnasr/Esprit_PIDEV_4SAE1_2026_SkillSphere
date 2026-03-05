package org.example.formation_service.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.example.formation_service.domain.enums.ResourceType;

@Entity
@Table(name = "lesson_resources")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonResource {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResourceType type;
    
    @Column(nullable = false)
    private String url;
    
    private Integer durationMinutes;
    
    private Long fileSizeBytes; // For PDF files
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;
}
