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
@Table(name = "sms_messages")
public class SmsMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "phone_number", nullable = false)
    private String phoneNumber;

    @Column(name = "sender_number")
    private String senderNumber;

    @Column(columnDefinition = "text")
    private String message;

    @Column(name = "received_at")
    private OffsetDateTime receivedAt;

    @Column(name = "external_id")
    private String externalId;

    @Column(nullable = false)
    private String status;

    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        if (status == null) status = "unread";
    }
}