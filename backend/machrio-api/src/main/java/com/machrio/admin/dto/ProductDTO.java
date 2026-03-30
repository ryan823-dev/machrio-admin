package com.machrio.admin.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductDTO {
    private UUID id;
    private String name;
    private String slug;
    private String sku;
    private String shortDescription;
    private String fullDescription;
    private UUID primaryCategoryId;
    private String brand;
    private String relatedProducts;
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
    private String createdAt;
    private String updatedAt;
}