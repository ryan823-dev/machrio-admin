package com.machrio.admin.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class CreateCustomerRequest {
    @NotBlank(message = "Company is required")
    private String company;
    @NotBlank(message = "Name is required")
    private String name;
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email")
    private String email;
    private String phone;
    private String title;
    private String source;
    private List<Map<String, Object>> shippingAddresses;
    private Map<String, Object> billingInfo;
    private List<String> tags;
    private String notes;
}
