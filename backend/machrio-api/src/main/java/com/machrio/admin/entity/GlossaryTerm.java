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
@Table(name = "glossary_terms")
public class GlossaryTerm {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String term;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(columnDefinition = "text")
    private String shortDefinition;

    @Column(columnDefinition = "text")
    private String fullDescription;

    @ElementCollection
    @CollectionTable(name = "glossary_synonyms", joinColumns = @JoinColumn(name = "term_id"))
    @Column(name = "synonym")
    private List<String> synonyms;

    @Column(columnDefinition = "text")
    private String relatedTerms;

    @Column(name = "category_slug")
    private String categorySlug;

    @Column(columnDefinition = "text")
    private String metaTitle;

    @Column(columnDefinition = "text")
    private String metaDescription;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private GlossaryStatus status = GlossaryStatus.published;

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
        if (status == null) status = GlossaryStatus.published;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    public enum GlossaryStatus {
        published,
        draft,
        archived
    }
}
