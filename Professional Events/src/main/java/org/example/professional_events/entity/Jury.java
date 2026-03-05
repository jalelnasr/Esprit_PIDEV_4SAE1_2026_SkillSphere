package org.example.professional_events.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "jury")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Jury {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "jury_id")
    private Long juryId;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "bio", columnDefinition = "LONGTEXT")
    private String bio;

    @Column(name = "expertise", length = 255)
    private String expertise;

    @Column(name = "rating")
    private Double rating;

    // Getters and Setters
    public Long getJuryId() {
        return juryId;
    }

    public void setJuryId(Long juryId) {
        this.juryId = juryId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getExpertise() {
        return expertise;
    }

    public void setExpertise(String expertise) {
        this.expertise = expertise;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }
}

