package com.machrio.admin.controller;

import com.machrio.admin.dto.*;
import com.machrio.admin.service.AIConversationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AIConversationController {

    private final AIConversationService aiConversationService;

    @GetMapping("/ai-conversations")
    public ResponseEntity<ApiResponse<PageResponse<AIConversationDTO>>> getConversations(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String search) {
        PageResponse<AIConversationDTO> result =
                aiConversationService.getConversations(page, pageSize, status, priority, search);
        return ResponseEntity.ok(ApiResponse.success(result, result.getTotalItems()));
    }

    @PostMapping("/ai-conversations/ingest-snapshot")
    public ResponseEntity<ApiResponse<AIConversationIngestResponse>> ingestSnapshot(
            @RequestBody AIConversationIngestRequest request) {
        return ResponseEntity.ok(ApiResponse.success(aiConversationService.ingestSnapshot(request), "Conversation snapshot ingested"));
    }

    @PostMapping("/ai-conversations")
    public ResponseEntity<ApiResponse<AIConversationIngestResponse>> ingestConversation(
            @RequestBody AIConversationIngestRequest request) {
        return ResponseEntity.ok(ApiResponse.success(aiConversationService.ingestSnapshot(request), "Conversation snapshot ingested"));
    }

    @GetMapping("/ai-conversations/{id}")
    public ResponseEntity<ApiResponse<AIConversationDetailDTO>> getConversationDetail(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(aiConversationService.getConversationDetail(id)));
    }

    @GetMapping("/ai-conversations/{id}/messages")
    public ResponseEntity<ApiResponse<List<ConversationMessageDTO>>> getConversationMessages(@PathVariable UUID id) {
        List<ConversationMessageDTO> items = aiConversationService.getConversationMessages(id);
        return ResponseEntity.ok(ApiResponse.success(items, items.size()));
    }

    @DeleteMapping("/ai-conversations/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteConversation(@PathVariable UUID id) {
        aiConversationService.deleteConversation(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Conversation deleted"));
    }

    @GetMapping("/customer-requirements")
    public ResponseEntity<ApiResponse<PageResponse<CustomerRequirementDTO>>> getCustomerRequirements(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String search) {
        PageResponse<CustomerRequirementDTO> result =
                aiConversationService.getRequirements(page, pageSize, status, priority, search);
        return ResponseEntity.ok(ApiResponse.success(result, result.getTotalItems()));
    }

    @PutMapping("/customer-requirements/{id}")
    public ResponseEntity<ApiResponse<CustomerRequirementDTO>> updateCustomerRequirement(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        return ResponseEntity.ok(ApiResponse.success(aiConversationService.updateRequirementStatus(id, status), "Requirement updated"));
    }
}
