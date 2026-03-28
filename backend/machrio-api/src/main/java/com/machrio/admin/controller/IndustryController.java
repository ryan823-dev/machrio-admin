package com.machrio.admin.controller;

import com.machrio.admin.dto.ApiResponse;
import com.machrio.admin.dto.CreateIndustryRequest;
import com.machrio.admin.dto.IndustryDTO;
import com.machrio.admin.dto.PageResponse;
import com.machrio.admin.service.IndustryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/industries")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class IndustryController {

    private final IndustryService industryService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<IndustryDTO>>> getAllIndustries(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(required = false) String search) {
        PageResponse<IndustryDTO> result = industryService.getAllIndustries(page, pageSize, search);
        return ResponseEntity.ok(ApiResponse.success(result, result.getTotalItems()));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<IndustryDTO>>> getAllIndustriesList() {
        List<IndustryDTO> industries = industryService.getAllIndustriesList();
        return ResponseEntity.ok(ApiResponse.success(industries));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<IndustryDTO>> getIndustryById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(industryService.getIndustryById(id)));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<IndustryDTO>> getIndustryBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.success(industryService.getIndustryBySlug(slug)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<IndustryDTO>> createIndustry(@Valid @RequestBody CreateIndustryRequest request) {
        IndustryDTO industry = industryService.createIndustry(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(industry, "Industry created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<IndustryDTO>> updateIndustry(@PathVariable UUID id, @Valid @RequestBody CreateIndustryRequest request) {
        return ResponseEntity.ok(ApiResponse.success(industryService.updateIndustry(id, request), "Industry updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteIndustry(@PathVariable UUID id) {
        industryService.deleteIndustry(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Industry deleted successfully"));
    }
}
