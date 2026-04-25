package com.machrio.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AIConversationIngestResponse {
    private UUID id;
    private String sessionId;
    private String status;
}
