package com.machrio.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerRequirementIngestDTO {
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String companyName;
    private String jobTitle;
    private String requirementType;
    private String productCategory;
    private List<String> productNames;
    private List<String> productIds;
    private Integer quantity;
    private String quantityUnit;
    private String unitPriceRange;
    private String totalBudget;
    private String currency;
    private String requiredDate;
    private String purchaseTimeline;
    private String urgency;
    private Map<String, Object> specifications;
    private String qualityRequirements;
    private List<String> certificationRequirements;
    private String customRequirements;
    private String shippingAddress;
    private String shippingCity;
    private String shippingState;
    private String shippingCountry;
    private String shippingPostalCode;
    private String shippingMethod;
    private String incoterms;
    private String paymentTerms;
    private String paymentMethod;
    private String priority;
    private String status;
    private Integer confidenceScore;
    private Integer leadScore;
    private String assignedTo;
    private String assignedAt;
    private String notes;
    private String nextFollowUpDate;
    private Boolean convertedToOrder;
    private String orderId;
    private String orderValue;
    private String convertedAt;
}
