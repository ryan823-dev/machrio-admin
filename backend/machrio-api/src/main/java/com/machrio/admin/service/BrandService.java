package com.machrio.admin.service;

import com.machrio.admin.dto.CreateBrandRequest;
import com.machrio.admin.dto.BrandDTO;
import com.machrio.admin.dto.PageResponse;
import com.machrio.admin.entity.Brand;
import com.machrio.admin.repository.BrandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BrandService {

    private final BrandRepository brandRepository;
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'").withZone(ZoneId.of("UTC"));

    public PageResponse<BrandDTO> getAllBrands(int page, int pageSize, String search) {
        PageRequest pageRequest = PageRequest.of(page - 1, pageSize, Sort.by("name").ascending());

        Page<Brand> brandPage;
        if (search != null && !search.isBlank()) {
            brandPage = brandRepository.searchByKeyword(search, pageRequest);
        } else {
            brandPage = brandRepository.findAll(pageRequest);
        }

        List<BrandDTO> dtos = brandPage.getContent().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return PageResponse.from(brandPage, dtos);
    }

    public List<BrandDTO> getFeaturedBrands() {
        return brandRepository.findByFeaturedTrueOrderByNameAsc().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<BrandDTO> getAllBrandsList() {
        return brandRepository.findAll(Sort.by("name").ascending()).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public BrandDTO getBrandById(UUID id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Brand not found: " + id));
        return toDTO(brand);
    }

    public BrandDTO getBrandBySlug(String slug) {
        Brand brand = brandRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Brand not found with slug: " + slug));
        return toDTO(brand);
    }

    @Transactional
    public BrandDTO createBrand(CreateBrandRequest request) {
        if (brandRepository.existsBySlug(request.getSlug())) {
            throw new RuntimeException("Brand with slug already exists: " + request.getSlug());
        }

        Brand brand = new Brand();
        updateBrandFromRequest(brand, request);
        brand = brandRepository.save(brand);
        return toDTO(brand);
    }

    @Transactional
    public BrandDTO updateBrand(UUID id, CreateBrandRequest request) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Brand not found: " + id));

        // Check slug uniqueness if changed
        if (!brand.getSlug().equals(request.getSlug()) && brandRepository.existsBySlug(request.getSlug())) {
            throw new RuntimeException("Brand with slug already exists: " + request.getSlug());
        }

        updateBrandFromRequest(brand, request);
        brand = brandRepository.save(brand);
        return toDTO(brand);
    }

    @Transactional
    public void deleteBrand(UUID id) {
        if (!brandRepository.existsById(id)) {
            throw new RuntimeException("Brand not found: " + id);
        }
        brandRepository.deleteById(id);
    }

    private void updateBrandFromRequest(Brand brand, CreateBrandRequest request) {
        brand.setName(request.getName());
        brand.setSlug(request.getSlug());
        brand.setLogo(request.getLogo());
        brand.setDescription(request.getDescription());
        brand.setWebsite(request.getWebsite());
        brand.setFeatured(request.getFeatured());
        brand.setSeo(request.getSeo());
    }

    private BrandDTO toDTO(Brand brand) {
        BrandDTO dto = new BrandDTO();
        dto.setId(brand.getId());
        dto.setName(brand.getName());
        dto.setSlug(brand.getSlug());
        dto.setLogo(brand.getLogo());
        dto.setDescription(brand.getDescription());
        dto.setWebsite(brand.getWebsite());
        dto.setFeatured(brand.getFeatured());
        dto.setSeo(brand.getSeo());
        dto.setCreatedAt(brand.getCreatedAt() != null ? FORMATTER.format(brand.getCreatedAt()) : null);
        dto.setUpdatedAt(brand.getUpdatedAt() != null ? FORMATTER.format(brand.getUpdatedAt()) : null);
        return dto;
    }
}
