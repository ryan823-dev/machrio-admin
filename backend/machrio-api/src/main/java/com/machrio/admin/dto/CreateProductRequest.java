package com.machrio.admin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
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
    private String fullDescription;
    private UUID primaryCategoryId;
    private String brand;
    private String relatedProducts;

    @NotBlank(message = "Status is required")
    private String status;

    private String availability;
    private String purchaseMode;
    private String leadTime;
    private Integer minOrderQuantity;
    private Integer packageQty;
    private String packageUnit;
    private BigDecimal weight;
    private String pricing;
    private String specifications;
    private String faq;
    private String images;
    private String externalImageUrl;
    private String additionalImageUrls;
    private String categories;
    private String tags;
    private String metaTitle;
    private String metaDescription;
    private String focusKeyword;
    private String sourceUrl;
    private String shippingInfo;
    private String meta;
    private String primaryImageId;
}