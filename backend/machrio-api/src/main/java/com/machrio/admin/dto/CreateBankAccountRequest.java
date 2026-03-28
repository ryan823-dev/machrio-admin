package com.machrio.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateBankAccountRequest {
    @NotBlank(message = "Country is required")
    private String country;
    
    @NotBlank(message = "Bank name is required")
    private String bankName;
    
    @NotBlank(message = "Account name is required")
    private String accountName;
    
    private String beneficiaryName;
    private String accountNumber;
    
    @NotBlank(message = "Currency is required")
    private String currency;
    
    private String swiftCode;
    private String localBankCode;
    private String localBankCodeLabel;
    private String routingNumber;
    private String iban;
    private String sortCode;
    private String bankAddress;
    private String additionalInfo;
    private String flag;
    private Integer sortOrder;
    private Boolean active;
}
