package org.example.formation_service.domain.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "learning_path_items", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"learning_path_id", "order_index"}),
    @UniqueConstraint(columnNames = {"learning_path_id", "course_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LearningPathItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "learning_path_id", nullable = false)
    private LearningPath learningPath;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;
    
    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;
}
