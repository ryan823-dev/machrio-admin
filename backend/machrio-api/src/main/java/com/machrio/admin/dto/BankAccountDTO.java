package com.machrio.admin.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BankAccountDTO {
    private UUID id;
    private String country;
    private String bankName;
    private String accountName;
    private String beneficiaryName;
    private String accountNumber;
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
    private String createdAt;
    private String updatedAt;
}
