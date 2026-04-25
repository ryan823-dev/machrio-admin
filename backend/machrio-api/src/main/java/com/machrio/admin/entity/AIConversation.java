package com.machrio.admin.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ai_conversations")
public class AIConversation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "session_id", nullable = false)
    private String sessionId;

    @Column(name = "user_id")
    private String userId;

    @Column(name = "user_name")
    private String userName;

    @Column(name = "user_email")
    private String userEmail;

    @Column(name = "user_phone")
    private String userPhone;

    @Column(name = "user_company")
    private String userCompany;

    @Column(name = "user_job_title")
    private String userJobTitle;

    @Column(name = "source_page")
    private String sourcePage;

    @Column(name = "source_url", columnDefinition = "text")
    private String sourceUrl;

    @Column(name = "conversation_type")
    private String conversationType;

    @Column(nullable = false)
    private String status;

    @Column(name = "intent_score")
    private Integer intentScore;

    @Column(nullable = false)
    private String priority;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "extracted_needs", columnDefinition = "jsonb")
    private Map<String, Object> extractedNeeds;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "product_interests", columnDefinition = "text[]")
    private String[] productInterests;

    @Column(name = "budget_range")
    private String budgetRange;

    @Column(name = "purchase_timeline")
    private String purchaseTimeline;

    @Column(name = "message_count")
    private Integer messageCount;

    @Column(name = "first_message_at")
    private OffsetDateTime firstMessageAt;

    @Column(name = "last_message_at")
    private OffsetDateTime lastMessageAt;

    @Column(name = "assigned_to")
    private String assignedTo;

    @Column(name = "follow_up_status")
    private String followUpStatus;

    @Column(name = "follow_up_notes", columnDefinition = "text")
    private String followUpNotes;

    @Column(name = "follow_up_deadline")
    private OffsetDateTime followUpDeadline;

    @Column(name = "converted_to_customer")
    private Boolean convertedToCustomer;

    @Column(name = "customer_id")
    private UUID customerId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata", columnDefinition = "jsonb")
    private Map<String, Object> metadata;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "tags", columnDefinition = "text[]")
    private String[] tags;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "user_agent", columnDefinition = "text")
    private String userAgent;

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
        if (status == null) {
            status = "active";
        }
        if (priority == null) {
            priority = "medium";
        }
        if (followUpStatus == null) {
            followUpStatus = "pending";
        }
        if (intentScore == null) {
            intentScore = 0;
        }
        if (messageCount == null) {
            messageCount = 0;
        }
        if (convertedToCustomer == null) {
            convertedToCustomer = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
