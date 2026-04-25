package com.machrio.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AIConversationDTO {
    private UUID id;
    private String sessionId;
    private String userName;
    private String userEmail;
    private String userPhone;
    private String userCompany;
    private String userJobTitle;
    private String sourcePage;
    private String sourceUrl;
    private String conversationType;
    private String status;
    private Integer intentScore;
    private String priority;
    private Map<String, Object> extractedNeeds;
    private String[] productInterests;
    private String budgetRange;
    private String purchaseTimeline;
    private Integer messageCount;
    private String firstMessageAt;
    private String lastMessageAt;
    private String assignedTo;
    private String followUpStatus;
    private String followUpNotes;
    private String followUpDeadline;
    private Boolean convertedToCustomer;
    private UUID customerId;
    private Map<String, Object> metadata;
    private String[] tags;
    private String createdAt;
    private String updatedAt;
    private Integer requirementCount;
}
