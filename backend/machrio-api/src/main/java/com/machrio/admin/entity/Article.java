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
@Table(name = "articles")
public class Article {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(columnDefinition = "text")
    private String shortDescription;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private ArticleContent content;

    @Column(columnDefinition = "text")
    private String coverImageUrl;

    @Column(columnDefinition = "text")
    private String author;

    @ElementCollection
    @CollectionTable(name = "article_tags", joinColumns = @JoinColumn(name = "article_id"))
    @Column(name = "tag")
    private List<String> tags;

    @Column(name = "category_slug")
    private String categorySlug;

    @Column(columnDefinition = "text")
    private String metaTitle;

    @Column(columnDefinition = "text")
    private String metaDescription;

    @Column(columnDefinition = "boolean default false")
    private Boolean featured;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private ArticleStatus status = ArticleStatus.published;

    @Column(name = "published_at")
    private OffsetDateTime publishedAt;

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
        if (status == null) status = ArticleStatus.published;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    public enum ArticleStatus {
        published,
        draft,
        archived
    }

    @Data
    public static class ArticleContent {
        private String html;
        private String text;
    }
}
