package com.machrio.admin.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CustomerDTO {
    private UUID id;
    private String company;
    private String name;
    private String email;
    private String phone;
    private String title;
    private String source;
    private List<Map<String, Object>> shippingAddresses;
    private Map<String, Object> billingInfo;
    private List<String> tags;
    private String notes;
    private String createdAt;
    private String updatedAt;
}
