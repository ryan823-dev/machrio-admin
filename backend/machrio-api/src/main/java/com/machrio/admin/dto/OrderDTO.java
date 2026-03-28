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
public class OrderDTO {
    private UUID id;
    private String orderNumber;
    private String status;
    private String paymentStatus;
    private String source;
    private UUID customerRefId;
    private Map<String, Object> customer;
    private List<Map<String, Object>> items;
    private Map<String, Object> shipping;
    private BigDecimal subtotal;
    private BigDecimal shippingCost;
    private BigDecimal tax;
    private BigDecimal total;
    private String currency;
    private Map<String, Object> payment;
    private String customerNotes;
    private String internalNotes;
    private String createdAt;
    private String updatedAt;
}
