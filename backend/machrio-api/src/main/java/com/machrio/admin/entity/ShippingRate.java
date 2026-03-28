package com.machrio.admin.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "shipping_rates")
public class ShippingRate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipping_method_id", nullable = false)
    private ShippingMethod shippingMethod;

    @Column(name = "country_code")
    private String countryCode;

    @Column(name = "base_weight")
    private BigDecimal baseWeight;

    @Column(name = "base_rate")
    private BigDecimal baseRate;

    @Column(name = "additional_rate")
    private BigDecimal additionalRate;

    @Column(name = "handling_fee")
    private BigDecimal handlingFee;

    @Column(name = "is_active")
    private Boolean active;

    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        updatedAt = OffsetDateTime.now();
        if (active == null) active = true;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
