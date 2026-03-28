package com.machrio.admin.controller;

import com.machrio.admin.dto.ApiResponse;
import com.machrio.admin.dto.PageResponse;
import com.machrio.admin.dto.RfqSubmissionDTO;
import com.machrio.admin.service.RfqSubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/rfq-submissions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RfqSubmissionController {

    private final RfqSubmissionService rfqService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<RfqSubmissionDTO>>> getAllRfqs(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(required = false) String status) {
        PageResponse<RfqSubmissionDTO> result = rfqService.getAllRfqs(page, pageSize, status);
        return ResponseEntity.ok(ApiResponse.success(result, result.getTotalItems()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RfqSubmissionDTO>> getRfqById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(rfqService.getRfqById(id)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<RfqSubmissionDTO>> updateRfqStatus(
            @PathVariable UUID id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        String notes = body.get("notes");
        return ResponseEntity.ok(ApiResponse.success(rfqService.updateRfqStatus(id, status, notes), "RFQ updated"));
    }
}
