package com.machrio.admin.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConversationMessageIngestDTO {
    @JsonAlias("role")
    private String messageType;
    private String content;
    private String contentType;
    private String aiModel;
    private Integer tokensUsed;
    private Integer processingTimeMs;
    private String confidenceScore;
    private Map<String, Object> contextData;
    private Map<String, Object> attachments;
    @JsonAlias("timestamp")
    private String createdAt;
    @Setter(AccessLevel.NONE)
    private List<Map<String, Object>> products;

    public void setProducts(List<Map<String, Object>> products) {
        this.products = products;
        if (products == null || products.isEmpty()) {
            return;
        }

        if (this.contextData == null) {
            this.contextData = new LinkedHashMap<>();
        }
        this.contextData.put("products", products);
    }
}
