package com.machrio.admin.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "shipping_methods")
public class ShippingMethod {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(columnDefinition = "text")
    private String description;

    @Column(columnDefinition = "text")
    private String icon;

    @Column(name = "transit_days")
    private Integer transitDays;

    @Column(name = "sort_order")
    private Integer sortOrder;

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
        if (sortOrder == null) sortOrder = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
