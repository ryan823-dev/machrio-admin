package com.machrio.admin.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RedirectDTO {
    private UUID id;
    private String sourceUrl;
    private String destinationUrl;
    private String type;
    private Boolean active;
    private String createdAt;
    private String updatedAt;
}
