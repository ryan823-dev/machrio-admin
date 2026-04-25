package com.machrio.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class AIConversationDetailDTO extends AIConversationDTO {
    private List<ConversationMessageDTO> messages;
    private List<CustomerRequirementDTO> requirements;
}
