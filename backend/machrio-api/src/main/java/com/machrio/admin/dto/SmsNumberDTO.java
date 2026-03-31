package com.machrio.admin.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SmsNumberDTO {
    private UUID id;
    private String phoneNumber;
    private String countryCode;
    private OffsetDateTime rentedAt;
    private OffsetDateTime expirationDate;
    private String plan;
    private Boolean autoRenew;
    private Integer messageCount;
    private OffsetDateTime lastSmsReceivedDate;
    private Boolean active;
}