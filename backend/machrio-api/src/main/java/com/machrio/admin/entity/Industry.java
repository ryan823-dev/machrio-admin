package com.machrio.admin.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.UUID;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "industries")
public class Industry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(columnDefinition = "text")
    private String shortDescription;

    @Column(columnDefinition = "text")
    private String description;

    @Column(columnDefinition = "text")
    private String heroImageUrl;

    @Column(columnDefinition = "text")
    private String iconEmoji;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<String> relatedIndustries;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<IndustryFeature> features;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<IndustryApplication> applications;

    @Column(columnDefinition = "text")
    private String metaTitle;

    @Column(columnDefinition = "text")
    private String metaDescription;

    @Column(columnDefinition = "boolean default false")
    private Boolean featured;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private IndustryStatus status = IndustryStatus.published;

    @Column(name = "display_order")
    private Integer displayOrder;

    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        updatedAt = OffsetDateTime.now();
        if (featured == null) featured = false;
        if (status == null) status = IndustryStatus.published;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    public enum IndustryStatus {
        published,
        draft,
        archived
    }

    @Data
    public static class IndustryFeature {
        private String title;
        private String description;
        private String icon;
    }

    @Data
    public static class IndustryApplication {
        private String title;
        private String description;
    }
}
