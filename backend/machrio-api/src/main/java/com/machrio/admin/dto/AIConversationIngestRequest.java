package com.machrio.admin.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AIConversationIngestRequest {
    private String sessionId;
    @JsonAlias("user_id")
    private String userId;
    @JsonAlias("user_name")
    private String userName;
    @JsonAlias("user_email")
    private String userEmail;
    @JsonAlias("user_phone")
    private String userPhone;
    @JsonAlias("user_company")
    private String userCompany;
    @JsonAlias("user_job_title")
    private String userJobTitle;
    private String sourcePage;
    private String sourceUrl;
    private String conversationType;
    private String status;
    private Integer intentScore;
    private String priority;
    private Map<String, Object> extractedNeeds;
    private List<String> productInterests;
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
    private String customerId;
    private Map<String, Object> metadata;
    private List<String> tags;
    private String ipAddress;
    private String userAgent;
    private UserIngestDTO user;
    private List<ConversationMessageIngestDTO> messages;
    private List<CustomerRequirementIngestDTO> requirements;
}
