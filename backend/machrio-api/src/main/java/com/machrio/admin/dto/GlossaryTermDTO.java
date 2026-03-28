package com.machrio.admin.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GlossaryTermDTO {
    private UUID id;
    private String term;
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
    private String createdAt;
    private String updatedAt;
}
