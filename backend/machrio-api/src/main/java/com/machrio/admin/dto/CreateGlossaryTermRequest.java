package com.machrio.admin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class CreateGlossaryTermRequest {
    @NotBlank(message = "Term is required")
    private String term;
    @NotBlank(message = "Slug is required")
    private String slug;
    private String shortDefinition;
    private String fullDescription;
    private List<String> synonyms;
    private String relatedTerms;
    private String categorySlug;
    private String metaTitle;
    private String metaDescription;
    private String status;
    private Integer displayOrder;
}
