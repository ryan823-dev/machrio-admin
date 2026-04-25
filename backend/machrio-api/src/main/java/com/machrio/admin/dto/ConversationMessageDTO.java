package com.machrio.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConversationMessageDTO {
    private UUID id;
    private UUID conversationId;
    private String messageType;
    private String content;
    private String contentType;
    private String aiModel;
    private Integer tokensUsed;
    private Integer processingTimeMs;
    private String confidenceScore;
    private Map<String, Object> contextData;
    private Map<String, Object> attachments;
    private String createdAt;
}
