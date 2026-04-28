package org.example.b2bmodule.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "packs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Pack {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String name;

    private String description;

    @NotNull
    @Positive
    private Integer formationsCount;

    @NotNull
    @Positive
    private BigDecimal price;

    @Builder.Default
    private Boolean isActive = true;

    @OneToMany(mappedBy = "pack", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PackPurchase> packPurchases;
}

