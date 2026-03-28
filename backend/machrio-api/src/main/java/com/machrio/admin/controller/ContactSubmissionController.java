package com.machrio.admin.controller;

import com.machrio.admin.dto.ApiResponse;
import com.machrio.admin.dto.ContactSubmissionDTO;
import com.machrio.admin.dto.PageResponse;
import com.machrio.admin.service.ContactSubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/contact-submissions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ContactSubmissionController {

    private final ContactSubmissionService contactService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ContactSubmissionDTO>>> getAllContacts(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        PageResponse<ContactSubmissionDTO> result = contactService.getAllContacts(page, pageSize, status, search);
        return ResponseEntity.ok(ApiResponse.success(result, result.getTotalItems()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ContactSubmissionDTO>> getContactById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(contactService.getContactById(id)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ContactSubmissionDTO>> updateContactStatus(
            @PathVariable UUID id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        String notes = body.get("notes");
        return ResponseEntity.ok(ApiResponse.success(contactService.updateContactStatus(id, status, notes), "Contact updated"));
    }
}
