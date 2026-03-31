package com.machrio.admin.controller;

import com.machrio.admin.dto.ApiResponse;
import com.machrio.admin.dto.PageResponse;
import com.machrio.admin.dto.SmsMessageDTO;
import com.machrio.admin.dto.SmsNumberDTO;
import com.machrio.admin.service.SmsService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sms")
public class SmsController {

    private final SmsService smsService;

    public SmsController(SmsService smsService) {
        this.smsService = smsService;
    }

    @GetMapping("/messages")
    public ResponseEntity<ApiResponse<PageResponse<SmsMessageDTO>>> getMessages(
            @RequestParam(required = false) String phoneNumber,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("receivedAt").descending());
        Page<SmsMessageDTO> messages = smsService.getMessages(phoneNumber, status, keyword, pageRequest);

        PageResponse<SmsMessageDTO> response = PageResponse.from(messages, messages.getContent());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/messages/{id}")
    public ResponseEntity<ApiResponse<SmsMessageDTO>> getMessageById(@PathVariable String id) {
        return smsService.getMessageById(id)
                .map(msg -> ResponseEntity.ok(ApiResponse.success(msg)))
                .orElse(ResponseEntity.ok(ApiResponse.error("Message not found")));
    }

    @PutMapping("/messages/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable String id) {
        smsService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Message marked as read"));
    }

    @DeleteMapping("/messages/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMessage(@PathVariable String id) {
        smsService.deleteMessage(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Message deleted"));
    }

    @GetMapping("/messages/stats")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getMessageStats() {
        return ResponseEntity.ok(ApiResponse.success(smsService.getMessageStats()));
    }

    @GetMapping("/numbers")
    public ResponseEntity<ApiResponse<List<SmsNumberDTO>>> getNumbers() {
        return ResponseEntity.ok(ApiResponse.success(smsService.getNumbers()));
    }

    @PostMapping("/sync")
    public ResponseEntity<ApiResponse<Void>> syncMessages() {
        smsService.syncMessagesFromApi();
        return ResponseEntity.ok(ApiResponse.success(null, "Messages synced"));
    }

    @PostMapping("/numbers/sync")
    public ResponseEntity<ApiResponse<Void>> syncNumbers() {
        smsService.syncNumbersFromApi();
        return ResponseEntity.ok(ApiResponse.success(null, "Numbers synced"));
    }

    @GetMapping("/balance")
    public ResponseEntity<ApiResponse<String>> getBalance() {
        String balance = smsService.fetchBalanceFromApi();
        return ResponseEntity.ok(ApiResponse.success(balance != null ? balance : "N/A"));
    }
}