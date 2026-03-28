package com.machrio.admin.controller;

import com.machrio.admin.dto.ApiResponse;
import com.machrio.admin.dto.CreateGlossaryTermRequest;
import com.machrio.admin.dto.GlossaryTermDTO;
import com.machrio.admin.dto.PageResponse;
import com.machrio.admin.service.GlossaryTermService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/glossary-terms")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class GlossaryTermController {

    private final GlossaryTermService glossaryTermService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<GlossaryTermDTO>>> getAllGlossaryTerms(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category) {
        PageResponse<GlossaryTermDTO> result = glossaryTermService.getAllGlossaryTerms(page, pageSize, search, category);
        return ResponseEntity.ok(ApiResponse.success(result, result.getTotalItems()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GlossaryTermDTO>> getGlossaryTermById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(glossaryTermService.getGlossaryTermById(id)));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<GlossaryTermDTO>> getGlossaryTermBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.success(glossaryTermService.getGlossaryTermBySlug(slug)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<GlossaryTermDTO>> createGlossaryTerm(@Valid @RequestBody CreateGlossaryTermRequest request) {
        GlossaryTermDTO term = glossaryTermService.createGlossaryTerm(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(term, "Glossary term created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<GlossaryTermDTO>> updateGlossaryTerm(@PathVariable UUID id, @Valid @RequestBody CreateGlossaryTermRequest request) {
        return ResponseEntity.ok(ApiResponse.success(glossaryTermService.updateGlossaryTerm(id, request), "Glossary term updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteGlossaryTerm(@PathVariable UUID id) {
        glossaryTermService.deleteGlossaryTerm(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Glossary term deleted successfully"));
    }
}
