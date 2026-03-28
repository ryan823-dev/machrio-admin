package com.machrio.admin.dto;

import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class ShippingMethodDTO {
    private UUID id;
    private String name;
    private String code;
    private String description;
    private String icon;
    private Integer transitDays;
    private Integer sortOrder;
    private Boolean active;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
