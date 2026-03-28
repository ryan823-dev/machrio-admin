package com.machrio.admin.service;

import com.machrio.admin.dto.CreateIndustryRequest;
import com.machrio.admin.dto.IndustryDTO;
import com.machrio.admin.dto.PageResponse;
import com.machrio.admin.entity.Industry;
import com.machrio.admin.repository.IndustryRepository;
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
public class IndustryService {

    private final IndustryRepository industryRepository;
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'").withZone(ZoneId.of("UTC"));

    public PageResponse<IndustryDTO> getAllIndustries(int page, int pageSize, String search) {
        PageRequest pageRequest = PageRequest.of(page - 1, pageSize, Sort.by("displayOrder").ascending().and(Sort.by("name").ascending()));

        Page<Industry> industryPage;
        if (search != null && !search.isBlank()) {
            industryPage = industryRepository.searchByKeyword(search, pageRequest);
        } else {
            industryPage = industryRepository.findAll(pageRequest);
        }

        List<IndustryDTO> dtos = industryPage.getContent().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return PageResponse.from(industryPage, dtos);
    }

    public List<IndustryDTO> getAllIndustriesList() {
        return industryRepository.findAll(Sort.by("displayOrder").ascending().and(Sort.by("name").ascending())).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<IndustryDTO> getFeaturedIndustries() {
        return industryRepository.findByFeaturedTrueOrderByNameAsc().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public IndustryDTO getIndustryById(UUID id) {
        Industry industry = industryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Industry not found: " + id));
        return toDTO(industry);
    }

    public IndustryDTO getIndustryBySlug(String slug) {
        Industry industry = industryRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Industry not found with slug: " + slug));
        return toDTO(industry);
    }

    @Transactional
    public IndustryDTO createIndustry(CreateIndustryRequest request) {
        if (industryRepository.existsBySlug(request.getSlug())) {
            throw new RuntimeException("Industry with slug already exists: " + request.getSlug());
        }

        Industry industry = new Industry();
        updateIndustryFromRequest(industry, request);
        industry = industryRepository.save(industry);
        return toDTO(industry);
    }

    @Transactional
    public IndustryDTO updateIndustry(UUID id, CreateIndustryRequest request) {
        Industry industry = industryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Industry not found: " + id));

        // Check slug uniqueness if changed
        if (!industry.getSlug().equals(request.getSlug()) && industryRepository.existsBySlug(request.getSlug())) {
            throw new RuntimeException("Industry with slug already exists: " + request.getSlug());
        }

        updateIndustryFromRequest(industry, request);
        industry = industryRepository.save(industry);
        return toDTO(industry);
    }

    @Transactional
    public void deleteIndustry(UUID id) {
        if (!industryRepository.existsById(id)) {
            throw new RuntimeException("Industry not found: " + id);
        }
        industryRepository.deleteById(id);
    }

    private void updateIndustryFromRequest(Industry industry, CreateIndustryRequest request) {
        industry.setName(request.getName());
        industry.setSlug(request.getSlug());
        industry.setShortDescription(request.getShortDescription());
        industry.setDescription(request.getDescription());
        industry.setHeroImageUrl(request.getHeroImageUrl());
        industry.setIconEmoji(request.getIconEmoji());
        industry.setRelatedIndustries(request.getRelatedIndustries());
        industry.setFeatures(request.getFeatures() != null ? 
            request.getFeatures().stream().map(f -> {
                Industry.IndustryFeature feature = new Industry.IndustryFeature();
                feature.setTitle(f.getTitle());
                feature.setDescription(f.getDescription());
                feature.setIcon(f.getIcon());
                return feature;
            }).collect(Collectors.toList()) : null);
        industry.setApplications(request.getApplications() != null ?
            request.getApplications().stream().map(a -> {
                Industry.IndustryApplication app = new Industry.IndustryApplication();
                app.setTitle(a.getTitle());
                app.setDescription(a.getDescription());
                return app;
            }).collect(Collectors.toList()) : null);
        industry.setMetaTitle(request.getMetaTitle());
        industry.setMetaDescription(request.getMetaDescription());
        industry.setFeatured(request.getFeatured());
        if (request.getStatus() != null) {
            industry.setStatus(Industry.IndustryStatus.valueOf(request.getStatus()));
        }
        industry.setDisplayOrder(request.getDisplayOrder());
    }

    private IndustryDTO toDTO(Industry industry) {
        IndustryDTO dto = new IndustryDTO();
        dto.setId(industry.getId());
        dto.setName(industry.getName());
        dto.setSlug(industry.getSlug());
        dto.setShortDescription(industry.getShortDescription());
        dto.setDescription(industry.getDescription());
        dto.setHeroImageUrl(industry.getHeroImageUrl());
        dto.setIconEmoji(industry.getIconEmoji());
        dto.setRelatedIndustries(industry.getRelatedIndustries());
        
        if (industry.getFeatures() != null) {
            dto.setFeatures(industry.getFeatures().stream().map(f -> {
                IndustryFeatureDTO feature = new IndustryFeatureDTO();
                feature.setTitle(f.getTitle());
                feature.setDescription(f.getDescription());
                feature.setIcon(f.getIcon());
                return feature;
            }).collect(Collectors.toList()));
        }
        
        if (industry.getApplications() != null) {
            dto.setApplications(industry.getApplications().stream().map(a -> {
                IndustryApplicationDTO app = new IndustryApplicationDTO();
                app.setTitle(a.getTitle());
                app.setDescription(a.getDescription());
                return app;
            }).collect(Collectors.toList()));
        }
        
        dto.setMetaTitle(industry.getMetaTitle());
        dto.setMetaDescription(industry.getMetaDescription());
        dto.setFeatured(industry.getFeatured());
        dto.setStatus(industry.getStatus().name());
        dto.setDisplayOrder(industry.getDisplayOrder());
        dto.setCreatedAt(industry.getCreatedAt() != null ? FORMATTER.format(industry.getCreatedAt()) : null);
        dto.setUpdatedAt(industry.getUpdatedAt() != null ? FORMATTER.format(industry.getUpdatedAt()) : null);
        return dto;
    }
}
