package com.machrio.admin.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ArticleDTO {
    private UUID id;
    private String title;
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
    private String publishedAt;
    private String createdAt;
    private String updatedAt;
}
