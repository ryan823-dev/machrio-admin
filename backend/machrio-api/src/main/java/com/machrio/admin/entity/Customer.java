package com.machrio.admin.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "customers")
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String company;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(columnDefinition = "text")
    private String phone;

    @Column(columnDefinition = "text")
    private String title;

    @Column(columnDefinition = "text")
    private String source;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "shipping_addresses", columnDefinition = "jsonb")
    private List<Map<String, Object>> shippingAddresses;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "billing_info", columnDefinition = "jsonb")
    private Map<String, Object> billingInfo;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<String> tags;

    @Column(columnDefinition = "text")
    private String notes;

    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        updatedAt = OffsetDateTime.now();
        if (source == null) source = "manual";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
