package com.machrio.admin.controller;

import com.machrio.admin.dto.ApiResponse;
import com.machrio.admin.dto.CreateRedirectRequest;
import com.machrio.admin.dto.RedirectDTO;
import com.machrio.admin.dto.PageResponse;
import com.machrio.admin.service.RedirectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/redirects")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RedirectController {

    private final RedirectService redirectService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<RedirectDTO>>> getAllRedirects(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(required = false) String search) {
        PageResponse<RedirectDTO> result = redirectService.getAllRedirects(page, pageSize, search);
        return ResponseEntity.ok(ApiResponse.success(result, result.getTotalItems()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RedirectDTO>> getRedirectById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(redirectService.getRedirectById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RedirectDTO>> createRedirect(@Valid @RequestBody CreateRedirectRequest request) {
        RedirectDTO redirect = redirectService.createRedirect(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(redirect, "Redirect created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RedirectDTO>> updateRedirect(@PathVariable UUID id, @Valid @RequestBody CreateRedirectRequest request) {
        return ResponseEntity.ok(ApiResponse.success(redirectService.updateRedirect(id, request), "Redirect updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRedirect(@PathVariable UUID id) {
        redirectService.deleteRedirect(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Redirect deleted successfully"));
    }
}
