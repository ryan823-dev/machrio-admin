package com.machrio.admin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class CreateArticleRequest {
    @NotBlank(message = "Title is required")
    private String title;
    @NotBlank(message = "Slug is required")
    private String slug;
    private String shortDescription;
    private ArticleContentDTO content;
    private String coverImageUrl;
    private String author;
    private List<String> tags;
    private String categorySlug;
    private String metaTitle;
    private String metaDescription;
    private Boolean featured;
    private String status;
    private Integer displayOrder;
}
