package com.machrio.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
public class CreateProductRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Slug is required")
    private String slug;

    @NotBlank(message = "SKU is required")
    private String sku;

    private String shortDescription;
    private Map<String, Object> fullDescription;
    private UUID primaryCategoryId;
    private String brand;
    private List<String> relatedProducts;

    @NotBlank(message = "Status is required")
    private String status;

    private String availability;
    private String purchaseMode;
    private String leadTime;
    private Integer minOrderQuantity;
    private Integer packageQty;
    private String packageUnit;
    private BigDecimal weight;
    private Map<String, Object> pricing;
    private Map<String, Object> specifications;
    private List<Map<String, Object>> faq;
    private String images;
    private String externalImageUrl;
    private List<String> additionalImageUrls;
    private List<Map<String, Object>> categories;
    private List<String> tags;
    private String metaTitle;
    private String metaDescription;
    private String focusKeyword;
    private String sourceUrl;
    private Map<String, Object> shippingInfo;
    private Map<String, Object> meta;
    private String primaryImageId;
}
