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
@Table(name = "contact_submissions")
public class ContactSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "submitted_at")
    private OffsetDateTime submittedAt;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    @Column(columnDefinition = "text")
    private String phone;

    @Column(columnDefinition = "text")
    private String company;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false, columnDefinition = "text")
    private String message;

    @Column(nullable = false)
    private String status;

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
        if (submittedAt == null) submittedAt = OffsetDateTime.now();
        if (status == null) status = "new";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
