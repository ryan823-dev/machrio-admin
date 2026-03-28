package com.machrio.admin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateRedirectRequest {
    @NotBlank(message = "Source URL is required")
    private String sourceUrl;
    @NotBlank(message = "Destination URL is required")
    private String destinationUrl;
    private String type;
    private Boolean active;
}
