package com.machrio.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
public class CreateOrderRequest {
    private String orderNumber;
    @NotBlank(message = "Status is required")
    private String status;
    private String paymentStatus;
    private String source;
    private UUID customerRefId;
    @NotNull(message = "Customer info is required")
    private Map<String, Object> customer;
    private List<Map<String, Object>> items;
    private Map<String, Object> shipping;
    private BigDecimal subtotal;
    private BigDecimal shippingCost;
    private BigDecimal tax;
    @NotNull(message = "Total is required")
    private BigDecimal total;
    private String currency;
    private Map<String, Object> payment;
    private String customerNotes;
    private String internalNotes;
}
