package com.machrio.admin.controller;

import com.machrio.admin.dto.ApiResponse;
import com.machrio.admin.dto.BrandDTO;
import com.machrio.admin.dto.CreateBrandRequest;
import com.machrio.admin.dto.PageResponse;
import com.machrio.admin.service.BrandService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/brands")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BrandController {

    private final BrandService brandService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<BrandDTO>>> getAllBrands(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(required = false) String search) {
        PageResponse<BrandDTO> result = brandService.getAllBrands(page, pageSize, search);
        return ResponseEntity.ok(ApiResponse.success(result, result.getTotalItems()));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<BrandDTO>>> getAllBrandsList() {
        List<BrandDTO> brands = brandService.getAllBrandsList();
        return ResponseEntity.ok(ApiResponse.success(brands));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BrandDTO>> getBrandById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(brandService.getBrandById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BrandDTO>> createBrand(@Valid @RequestBody CreateBrandRequest request) {
        BrandDTO brand = brandService.createBrand(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(brand, "Brand created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BrandDTO>> updateBrand(@PathVariable UUID id, @Valid @RequestBody CreateBrandRequest request) {
        return ResponseEntity.ok(ApiResponse.success(brandService.updateBrand(id, request), "Brand updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBrand(@PathVariable UUID id) {
        brandService.deleteBrand(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Brand deleted successfully"));
    }
}
