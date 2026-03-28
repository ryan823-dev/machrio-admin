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
@Table(name = "redirects")
public class Redirect {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String sourceUrl;

    @Column(nullable = false)
    private String destinationUrl;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private RedirectType type = RedirectType.Permanent;

    @Column(columnDefinition = "boolean default true")
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
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    public enum RedirectType {
        Permanent,  // 301
        Temporary   // 302
    }
}
