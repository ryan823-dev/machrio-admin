package com.machrio.admin.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ContactSubmissionDTO {
    private UUID id;
    private String submittedAt;
    private String name;
    private String email;
    private String phone;
    private String company;
    private String subject;
    private String message;
    private String status;
    private String notes;
    private String createdAt;
    private String updatedAt;
}
