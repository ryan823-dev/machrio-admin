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
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String slug;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "short_description", columnDefinition = "text")
    private String shortDescription;

    @Column(name = "parent_id")
    private UUID parentId;

    @Column(columnDefinition = "integer default 1")
    private Integer level;

    @Column(name = "display_order", columnDefinition = "integer default 0")
    private Integer displayOrder;

    @Column(columnDefinition = "text")
    private String image;

    @Column(columnDefinition = "text")
    private String icon;

    @Column(name = "icon_emoji", columnDefinition = "text")
    private String iconEmoji;

    @Column(columnDefinition = "boolean default false")
    private Boolean featured;

    @Column(columnDefinition = "text")
    private String status;

    @Column(name = "meta_title", columnDefinition = "text")
    private String metaTitle;

    @Column(name = "meta_description", columnDefinition = "text")
    private String metaDescription;

    @Column(columnDefinition = "text")
    private String introContent;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "faq", columnDefinition = "jsonb")
    private List<Map<String, Object>> faq;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "facet_groups", columnDefinition = "jsonb")
    private List<Map<String, Object>> facetGroups;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> seo;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "seo_content", columnDefinition = "jsonb")
    private Map<String, Object> seoContent;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "buying_guide", columnDefinition = "jsonb")
    private Map<String, Object> buyingGuide;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> meta;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "custom_fields", columnDefinition = "jsonb")
    private Map<String, Object> customFields;

    @Column(name = "hero_image_id", columnDefinition = "text")
    private String heroImageId;

    @Column(name = "icon_id", columnDefinition = "text")
    private String iconId;

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
