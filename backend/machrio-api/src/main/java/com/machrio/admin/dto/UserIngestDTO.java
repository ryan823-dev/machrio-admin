package com.machrio.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserIngestDTO {
    private String userId;
    private String userName;
    private String userEmail;
    private String userPhone;
    private String userCompany;
    private String userJobTitle;
}
