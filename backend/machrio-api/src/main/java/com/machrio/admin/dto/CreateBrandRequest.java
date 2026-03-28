package com.machrio.admin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Map;

@Data
public class CreateBrandRequest {
    @NotBlank(message = "Name is required")
    private String name;
    @NotBlank(message = "Slug is required")
    private String slug;
    private String logo;
    private String description;
    private String website;
    private Boolean featured;
    private Map<String, Object> seo;
}
