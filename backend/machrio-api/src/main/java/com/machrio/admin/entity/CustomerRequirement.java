package com.machrio.admin.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "customer_requirements")
public class CustomerRequirement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "conversation_id", nullable = false)
    private UUID conversationId;

    @Column(name = "customer_name")
    private String customerName;

    @Column(name = "customer_email")
    private String customerEmail;

    @Column(name = "customer_phone")
    private String customerPhone;

    @Column(name = "company_name")
    private String companyName;

    @Column(name = "job_title")
    private String jobTitle;

    @Column(name = "requirement_type")
    private String requirementType;

    @Column(name = "product_category")
    private String productCategory;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "product_names", columnDefinition = "text[]")
    private String[] productNames;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "product_ids", columnDefinition = "text[]")
    private String[] productIds;

    private Integer quantity;

    @Column(name = "quantity_unit")
    private String quantityUnit;

    @Column(name = "unit_price_range")
    private String unitPriceRange;

    @Column(name = "total_budget")
    private String totalBudget;

    private String currency;

    @Column(name = "required_date")
    private LocalDate requiredDate;

    @Column(name = "purchase_timeline")
    private String purchaseTimeline;

    private String urgency;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> specifications;

    @Column(name = "quality_requirements", columnDefinition = "text")
    private String qualityRequirements;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "certification_requirements", columnDefinition = "text[]")
    private String[] certificationRequirements;

    @Column(name = "custom_requirements", columnDefinition = "text")
    private String customRequirements;

    @Column(name = "shipping_address", columnDefinition = "text")
    private String shippingAddress;

    @Column(name = "shipping_city")
    private String shippingCity;

    @Column(name = "shipping_state")
    private String shippingState;

    @Column(name = "shipping_country")
    private String shippingCountry;

    @Column(name = "shipping_postal_code")
    private String shippingPostalCode;

    @Column(name = "shipping_method")
    private String shippingMethod;

    private String incoterms;

    @Column(name = "payment_terms")
    private String paymentTerms;

    @Column(name = "payment_method")
    private String paymentMethod;

    private String priority;

    private String status;

    @Column(name = "confidence_score")
    private Integer confidenceScore;

    @Column(name = "lead_score")
    private Integer leadScore;

    @Column(name = "assigned_to")
    private String assignedTo;

    @Column(name = "assigned_at")
    private OffsetDateTime assignedAt;

    @Column(columnDefinition = "text")
    private String notes;

    @Column(name = "next_follow_up_date")
    private OffsetDateTime nextFollowUpDate;

    @Column(name = "converted_to_order")
    private Boolean convertedToOrder;

    @Column(name = "order_id")
    private UUID orderId;

    @Column(name = "order_value", precision = 15, scale = 2)
    private BigDecimal orderValue;

    @Column(name = "converted_at")
    private OffsetDateTime convertedAt;

    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
        if (priority == null) {
            priority = "medium";
        }
        if (status == null) {
            status = "new";
        }
        if (currency == null) {
            currency = "USD";
        }
        if (confidenceScore == null) {
            confidenceScore = 0;
        }
        if (leadScore == null) {
            leadScore = 0;
        }
        if (convertedToOrder == null) {
            convertedToOrder = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
