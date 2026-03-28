package com.machrio.admin.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BrandDTO {
    private UUID id;
    private String name;
    private String slug;
    private String logo;
    private String description;
    private String website;
    private Boolean featured;
    private Map<String, Object> seo;
    private String createdAt;
    private String updatedAt;
}
