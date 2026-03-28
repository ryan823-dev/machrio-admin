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
@Table(name = "bank_accounts")
public class BankAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String country;

    @Column(name = "bank_name", nullable = false)
    private String bankName;

    @Column(name = "account_name", nullable = false)
    private String accountName;

    @Column(name = "beneficiary_name")
    private String beneficiaryName;

    @Column(name = "account_number")
    private String accountNumber;

    @Column(nullable = false)
    private String currency;

    @Column(name = "swift_code")
    private String swiftCode;

    @Column(name = "local_bank_code")
    private String localBankCode;

    @Column(name = "local_bank_code_label")
    private String localBankCodeLabel;

    @Column(name = "routing_number")
    private String routingNumber;

    @Column(name = "iban")
    private String iban;

    @Column(name = "sort_code")
    private String sortCode;

    @Column(name = "bank_address")
    private String bankAddress;

    @Column(name = "additional_info", columnDefinition = "text")
    private String additionalInfo;

    @Column(name = "flag")
    private String flag;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @Column(name = "is_active")
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
        if (sortOrder == null) sortOrder = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
