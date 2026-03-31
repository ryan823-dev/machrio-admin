package com.machrio.admin.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SmsMessageDTO {
    private UUID id;
    private String phoneNumber;
    private String senderNumber;
    private String message;
    private OffsetDateTime receivedAt;
    private String status;
    private OffsetDateTime createdAt;
}