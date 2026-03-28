package com.machrio.admin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class CreateIndustryRequest {
    @NotBlank(message = "Name is required")
    private String name;
    @NotBlank(message = "Slug is required")
    private String slug;
    private String shortDescription;
    private String description;
    private String heroImageUrl;
    private String iconEmoji;
    private List<String> relatedIndustries;
    private List<IndustryFeatureDTO> features;
    private List<IndustryApplicationDTO> applications;
    private String metaTitle;
    private String metaDescription;
    private Boolean featured;
    private String status;
    private Integer displayOrder;
}
