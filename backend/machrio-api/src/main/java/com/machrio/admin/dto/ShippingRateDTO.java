package com.machrio.admin.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class ShippingRateDTO {
    private UUID id;
    private UUID shippingMethodId;
    private String shippingMethodName;
    private String countryCode;
    private BigDecimal baseWeight;
    private BigDecimal baseRate;
    private BigDecimal additionalRate;
    private BigDecimal handlingFee;
    private Boolean active;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
