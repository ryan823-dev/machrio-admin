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
@Table(name = "sms_numbers")
public class SmsNumber {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "phone_number", nullable = false, unique = true)
    private String phoneNumber;

    @Column(name = "country_code")
    private String countryCode;

    @Column(name = "rented_at")
    private OffsetDateTime rentedAt;

    @Column(name = "expiration_date")
    private OffsetDateTime expirationDate;

    private String plan;

    @Column(name = "auto_renew")
    private Boolean autoRenew;

    @Column(name = "message_count")
    private Integer messageCount;

    @Column(name = "last_sms_received_date")
    private OffsetDateTime lastSmsReceivedDate;

    @Column(nullable = false)
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
}