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

    @Column(name = "full_description", columnDefinition = "text")
    private String fullDescription;

    @Column(name = "primary_category_id")
    private UUID primaryCategoryId;

    @Column(columnDefinition = "text")
    private String brand;

    @Column(name = "related_products", columnDefinition = "text")
    private String relatedProducts;

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

    @Column(columnDefinition = "text")
    private String pricing;

    @Column(columnDefinition = "text")
    private String specifications;

    @Column(columnDefinition = "text")
    private String faq;

    @Column(name = "images", columnDefinition = "text")
    private String images;

    @Column(name = "external_image_url", columnDefinition = "text")
    private String externalImageUrl;

    @Column(name = "additional_image_urls", columnDefinition = "text")
    private String additionalImageUrls;

    @Column(columnDefinition = "text")
    private String categories;

    @Column(columnDefinition = "text")
    private String tags;

    @Column(name = "meta_title", columnDefinition = "text")
    private String metaTitle;

    @Column(name = "meta_description", columnDefinition = "text")
    private String metaDescription;

    @Column(name = "focus_keyword", columnDefinition = "text")
    private String focusKeyword;

    @Column(name = "source_url", columnDefinition = "text")
    private String sourceUrl;

    @Column(name = "shipping_info", columnDefinition = "text")
    private String shippingInfo;

    @Column(columnDefinition = "text")
    private String meta;

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