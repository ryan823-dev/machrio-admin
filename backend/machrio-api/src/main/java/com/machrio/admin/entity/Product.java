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
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String slug;

    @Column(unique = true)
    private String sku;

    @Column(name = "short_description", columnDefinition = "text")
    private String shortDescription;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "full_description", columnDefinition = "jsonb")
    private Map<String, Object> fullDescription;

    @Column(name = "primary_category_id")
    private UUID primaryCategoryId;

    @Column(columnDefinition = "text")
    private String brand;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "related_products", columnDefinition = "jsonb")
    private List<String> relatedProducts;

    @Column(columnDefinition = "text")
    private String status;

    @Column(columnDefinition = "text")
    private String availability;

    @Column(name = "purchase_mode", columnDefinition = "text")
    private String purchaseMode;

    @Column(name = "lead_time", columnDefinition = "text")
    private String leadTime;

    @Column(name = "min_order_quantity", columnDefinition = "integer")
    private Integer minOrderQuantity;

    @Column(name = "package_qty", columnDefinition = "integer")
    private Integer packageQty;

    @Column(name = "package_unit", columnDefinition = "text")
    private String packageUnit;

    @Column(columnDefinition = "numeric")
    private BigDecimal weight;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> pricing;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> specifications;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<Map<String, Object>> faq;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "images", columnDefinition = "jsonb")
    private String images;

    @Column(name = "external_image_url", columnDefinition = "text")
    private String externalImageUrl;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "additional_image_urls", columnDefinition = "jsonb")
    private List<String> additionalImageUrls;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<Map<String, Object>> categories;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<String> tags;

    @Column(name = "meta_title", columnDefinition = "text")
    private String metaTitle;

    @Column(name = "meta_description", columnDefinition = "text")
    private String metaDescription;

    @Column(name = "focus_keyword", columnDefinition = "text")
    private String focusKeyword;

    @Column(name = "source_url", columnDefinition = "text")
    private String sourceUrl;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "shipping_info", columnDefinition = "jsonb")
    private Map<String, Object> shippingInfo;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> meta;

    @Column(name = "primary_image_id", columnDefinition = "text")
    private String primaryImageId;

    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        updatedAt = OffsetDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
