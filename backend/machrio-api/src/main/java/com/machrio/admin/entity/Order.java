package com.machrio.admin.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "order_number", unique = true, nullable = false)
    private String orderNumber;

    @Column(nullable = false)
    private String status;

    @Column(name = "payment_status", nullable = false)
    private String paymentStatus;

    @Column(columnDefinition = "text")
    private String source;

    @Column(name = "customer_ref_id")
    private UUID customerRefId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> customer;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<Map<String, Object>> items;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> shipping;

    @Column(columnDefinition = "numeric")
    private BigDecimal subtotal;

    @Column(name = "shipping_cost", columnDefinition = "numeric")
    private BigDecimal shippingCost;

    @Column(columnDefinition = "numeric")
    private BigDecimal tax;

    @Column(columnDefinition = "numeric")
    private BigDecimal total;

    @Column(columnDefinition = "text")
    private String currency;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> payment;

    @Column(name = "customer_notes", columnDefinition = "text")
    private String customerNotes;

    @Column(name = "internal_notes", columnDefinition = "text")
    private String internalNotes;

    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        updatedAt = OffsetDateTime.now();
        if (orderNumber == null) {
            String ts = Long.toString(System.currentTimeMillis(), 36).toUpperCase();
            String rand = Long.toString((long)(Math.random() * 46656), 36).toUpperCase();
            orderNumber = "MRO-" + ts + "-" + rand;
        }
        if (status == null) status = "pending";
        if (paymentStatus == null) paymentStatus = "unpaid";
        if (currency == null) currency = "USD";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
