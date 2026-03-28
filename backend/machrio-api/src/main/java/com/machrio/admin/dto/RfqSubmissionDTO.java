package com.machrio.admin.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RfqSubmissionDTO {
    private UUID id;
    private String submittedAt;
    private Map<String, Object> customer;
    private Map<String, Object> inquiry;
    private UUID customerRefId;
    private String status;
    private String notes;
    private Map<String, Object> source;
    private String createdAt;
    private String updatedAt;
}
