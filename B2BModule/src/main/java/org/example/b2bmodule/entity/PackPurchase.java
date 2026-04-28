package org.example.b2bmodule.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "pack_purchases")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PackPurchase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pack_id", nullable = false)
    private Pack pack;

    private BigDecimal totalAmount;

    @Builder.Default
    private Instant purchaseDate = Instant.now();

    @PrePersist
    protected void onCreate() {
        if (this.purchaseDate == null) this.purchaseDate = Instant.now();
    }
}

