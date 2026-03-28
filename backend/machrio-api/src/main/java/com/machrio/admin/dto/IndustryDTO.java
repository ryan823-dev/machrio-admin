package com.machrio.admin.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class IndustryDTO {
    private UUID id;
    private String name;
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
    private String createdAt;
    private String updatedAt;
}

@Data
@AllArgsConstructor
@NoArgsConstructor
class IndustryFeatureDTO {
    private String title;
    private String description;
    private String icon;
}

@Data
@AllArgsConstructor
@NoArgsConstructor
class IndustryApplicationDTO {
    private String title;
    private String description;
}
