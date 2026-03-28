package com.machrio.admin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
public class CreateCategoryRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Slug is required")
    private String slug;

    private String description;
    private String shortDescription;
    private UUID parentId;
    private Integer level;
    private Integer displayOrder;
    private String image;
    private String icon;
    private String iconEmoji;
    private Boolean featured;
    private String status;
    private String metaTitle;
    private String metaDescription;
    private String introContent;
    private List<Map<String, Object>> faq;
    private List<Map<String, Object>> facetGroups;
    private Map<String, Object> seo;
    private Map<String, Object> seoContent;
    private Map<String, Object> buyingGuide;
    private Map<String, Object> meta;
    private Map<String, Object> customFields;
    private String heroImageId;
    private String heroImageUrl;
    private String iconId;
}
