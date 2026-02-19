package com.esprit.examen.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "badges")
public class Badge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long badgeId;

    private String name;

    private String description;

    private String iconUrl;

    private Integer requiredPoints;

    private Integer requiredLevel;

    @JsonIgnore
    @ManyToMany(mappedBy = "badges")
    private List<User> users;
}