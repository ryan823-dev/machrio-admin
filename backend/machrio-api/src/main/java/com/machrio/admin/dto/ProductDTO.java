package com.machrio.admin.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
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
    private Map<String, Object> fullDescription;
    private UUID primaryCategoryId;
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
    private String createdAt;
    private String updatedAt;
}
