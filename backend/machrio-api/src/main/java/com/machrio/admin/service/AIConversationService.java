package com.machrio.admin.service;

import com.machrio.admin.dto.AIConversationDTO;
import com.machrio.admin.dto.AIConversationDetailDTO;
import com.machrio.admin.dto.AIConversationIngestRequest;
import com.machrio.admin.dto.AIConversationIngestResponse;
import com.machrio.admin.dto.ConversationMessageDTO;
import com.machrio.admin.dto.ConversationMessageIngestDTO;
import com.machrio.admin.dto.CustomerRequirementDTO;
import com.machrio.admin.dto.CustomerRequirementIngestDTO;
import com.machrio.admin.dto.PageResponse;
import com.machrio.admin.entity.AIConversation;
import com.machrio.admin.entity.ConversationMessage;
import com.machrio.admin.entity.CustomerRequirement;
import com.machrio.admin.repository.AIConversationRepository;
import com.machrio.admin.repository.ConversationMessageRepository;
import com.machrio.admin.repository.CustomerRequirementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneId;
import java.time.OffsetDateTime;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.math.BigDecimal;
import java.util.List;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AIConversationService {

    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'").withZone(ZoneId.of("UTC"));

    private final AIConversationRepository aiConversationRepository;
    private final ConversationMessageRepository conversationMessageRepository;
    private final CustomerRequirementRepository customerRequirementRepository;

    public PageResponse<AIConversationDTO> getConversations(int page, int pageSize, String status, String priority, String search) {
        PageRequest pageRequest = PageRequest.of(page - 1, pageSize, Sort.by("lastMessageAt").descending().and(Sort.by("createdAt").descending()));
        String normalizedStatus = normalize(status);
        String normalizedPriority = normalize(priority);
        String normalizedSearch = normalize(search);

        Page<AIConversation> conversationPage;
        if (normalizedSearch != null) {
            conversationPage = aiConversationRepository.search(normalizedStatus, normalizedPriority, normalizedSearch, pageRequest);
        } else if (normalizedStatus != null && normalizedPriority != null) {
            conversationPage = aiConversationRepository.findByStatusAndPriority(normalizedStatus, normalizedPriority, pageRequest);
        } else if (normalizedStatus != null) {
            conversationPage = aiConversationRepository.findByStatus(normalizedStatus, pageRequest);
        } else if (normalizedPriority != null) {
            conversationPage = aiConversationRepository.findByPriority(normalizedPriority, pageRequest);
        } else {
            conversationPage = aiConversationRepository.findAll(pageRequest);
        }
        List<AIConversationDTO> items = conversationPage.getContent().stream()
                .map(this::toConversationDto)
                .collect(Collectors.toList());

        return PageResponse.from(conversationPage, items);
    }

    public AIConversationDetailDTO getConversationDetail(UUID id) {
        AIConversation conversation = getConversationEntity(id);
        List<ConversationMessageDTO> messages = resolveConversationMessages(conversation);
        List<CustomerRequirementDTO> requirements = customerRequirementRepository.findByConversationIdOrderByCreatedAtDesc(id).stream()
                .map(this::toRequirementDto)
                .collect(Collectors.toList());

        AIConversationDTO base = toConversationDto(conversation);
        AIConversationDetailDTO detail = new AIConversationDetailDTO();
        copyConversationFields(base, detail);
        detail.setMessages(messages);
        detail.setRequirements(requirements);
        return detail;
    }

    public List<ConversationMessageDTO> getConversationMessages(UUID id) {
        AIConversation conversation = getConversationEntity(id);
        return resolveConversationMessages(conversation);
    }

    @Transactional
    public void deleteConversation(UUID id) {
        ensureConversationExists(id);
        aiConversationRepository.deleteById(id);
    }

    @Transactional
    public AIConversationIngestResponse ingestSnapshot(AIConversationIngestRequest request) {
        if (request == null || request.getSessionId() == null || request.getSessionId().isBlank()) {
            throw new RuntimeException("sessionId is required");
        }

        normalizeRequest(request);

        boolean existed = aiConversationRepository.findBySessionId(request.getSessionId()).isPresent();
        AIConversation conversation = aiConversationRepository.findBySessionId(request.getSessionId())
                .orElseGet(AIConversation::new);

        conversation.setSessionId(request.getSessionId());
        conversation.setUserId(request.getUserId());
        conversation.setUserName(request.getUserName());
        conversation.setUserEmail(request.getUserEmail());
        conversation.setUserPhone(request.getUserPhone());
        conversation.setUserCompany(request.getUserCompany());
        conversation.setUserJobTitle(request.getUserJobTitle());
        conversation.setSourcePage(request.getSourcePage());
        conversation.setSourceUrl(request.getSourceUrl());
        conversation.setConversationType(defaultIfBlank(request.getConversationType(), "other"));
        conversation.setStatus(defaultIfBlank(request.getStatus(), "active"));
        conversation.setIntentScore(request.getIntentScore() != null ? request.getIntentScore() : 0);
        conversation.setPriority(defaultIfBlank(request.getPriority(), "medium"));
        conversation.setExtractedNeeds(orEmptyMap(request.getExtractedNeeds()));
        conversation.setProductInterests(toArray(request.getProductInterests()));
        conversation.setBudgetRange(request.getBudgetRange());
        conversation.setPurchaseTimeline(request.getPurchaseTimeline());
        conversation.setAssignedTo(request.getAssignedTo());
        conversation.setFollowUpStatus(defaultIfBlank(request.getFollowUpStatus(), "pending"));
        conversation.setFollowUpNotes(request.getFollowUpNotes());
        conversation.setFollowUpDeadline(parseDateTime(request.getFollowUpDeadline()));
        conversation.setConvertedToCustomer(Boolean.TRUE.equals(request.getConvertedToCustomer()));
        conversation.setCustomerId(parseUuid(request.getCustomerId()));
        conversation.setMetadata(orEmptyMap(request.getMetadata()));
        conversation.setTags(toArray(request.getTags()));
        conversation.setIpAddress(request.getIpAddress());
        conversation.setUserAgent(request.getUserAgent());

        List<ConversationMessageIngestDTO> incomingMessages = request.getMessages() != null ? request.getMessages() : List.of();
        conversation.setMessageCount(request.getMessageCount() != null ? request.getMessageCount() : incomingMessages.size());
        conversation.setFirstMessageAt(resolveFirstMessageAt(request, incomingMessages));
        conversation.setLastMessageAt(resolveLastMessageAt(request, incomingMessages));

        AIConversation savedConversation = aiConversationRepository.save(conversation);

        conversationMessageRepository.deleteByConversationId(savedConversation.getId());
        customerRequirementRepository.deleteByConversationId(savedConversation.getId());

        List<ConversationMessage> messagesToSave = new ArrayList<>();
        for (ConversationMessageIngestDTO item : incomingMessages) {
            if (item == null || item.getContent() == null || item.getContent().isBlank()) {
                continue;
            }
            ConversationMessage message = new ConversationMessage();
            message.setConversationId(savedConversation.getId());
            message.setMessageType(defaultIfBlank(item.getMessageType(), "user"));
            message.setContent(item.getContent());
            message.setContentType(defaultIfBlank(item.getContentType(), "text"));
            message.setAiModel(item.getAiModel());
            message.setTokensUsed(item.getTokensUsed());
            message.setProcessingTimeMs(item.getProcessingTimeMs());
            message.setConfidenceScore(parseDecimal(item.getConfidenceScore()));
            message.setContextData(item.getContextData());
            message.setAttachments(item.getAttachments());
            message.setCreatedAt(parseDateTime(item.getCreatedAt()));
            messagesToSave.add(message);
        }
        if (!messagesToSave.isEmpty()) {
            conversationMessageRepository.saveAll(messagesToSave);
        }

        List<CustomerRequirement> requirementsToSave = new ArrayList<>();
        List<CustomerRequirementIngestDTO> incomingRequirements = request.getRequirements() != null ? request.getRequirements() : List.of();
        for (CustomerRequirementIngestDTO item : incomingRequirements) {
            if (item == null) {
                continue;
            }
            CustomerRequirement requirement = new CustomerRequirement();
            requirement.setConversationId(savedConversation.getId());
            requirement.setCustomerName(item.getCustomerName());
            requirement.setCustomerEmail(item.getCustomerEmail());
            requirement.setCustomerPhone(item.getCustomerPhone());
            requirement.setCompanyName(item.getCompanyName());
            requirement.setJobTitle(item.getJobTitle());
            requirement.setRequirementType(defaultIfBlank(item.getRequirementType(), "other"));
            requirement.setProductCategory(item.getProductCategory());
            requirement.setProductNames(toArray(item.getProductNames()));
            requirement.setProductIds(toArray(item.getProductIds()));
            requirement.setQuantity(item.getQuantity());
            requirement.setQuantityUnit(item.getQuantityUnit());
            requirement.setUnitPriceRange(item.getUnitPriceRange());
            requirement.setTotalBudget(item.getTotalBudget());
            requirement.setCurrency(defaultIfBlank(item.getCurrency(), "USD"));
            requirement.setRequiredDate(parseDate(item.getRequiredDate()));
            requirement.setPurchaseTimeline(item.getPurchaseTimeline());
            requirement.setUrgency(defaultIfBlank(item.getUrgency(), "flexible"));
            requirement.setSpecifications(orEmptyMap(item.getSpecifications()));
            requirement.setQualityRequirements(item.getQualityRequirements());
            requirement.setCertificationRequirements(toArray(item.getCertificationRequirements()));
            requirement.setCustomRequirements(item.getCustomRequirements());
            requirement.setShippingAddress(item.getShippingAddress());
            requirement.setShippingCity(item.getShippingCity());
            requirement.setShippingState(item.getShippingState());
            requirement.setShippingCountry(item.getShippingCountry());
            requirement.setShippingPostalCode(item.getShippingPostalCode());
            requirement.setShippingMethod(item.getShippingMethod());
            requirement.setIncoterms(item.getIncoterms());
            requirement.setPaymentTerms(item.getPaymentTerms());
            requirement.setPaymentMethod(item.getPaymentMethod());
            requirement.setPriority(defaultIfBlank(item.getPriority(), "medium"));
            requirement.setStatus(defaultIfBlank(item.getStatus(), "new"));
            requirement.setConfidenceScore(item.getConfidenceScore() != null ? item.getConfidenceScore() : 0);
            requirement.setLeadScore(item.getLeadScore() != null ? item.getLeadScore() : 0);
            requirement.setAssignedTo(item.getAssignedTo());
            requirement.setAssignedAt(parseDateTime(item.getAssignedAt()));
            requirement.setNotes(item.getNotes());
            requirement.setNextFollowUpDate(parseDateTime(item.getNextFollowUpDate()));
            requirement.setConvertedToOrder(Boolean.TRUE.equals(item.getConvertedToOrder()));
            requirement.setOrderId(parseUuid(item.getOrderId()));
            requirement.setOrderValue(parseDecimal(item.getOrderValue()));
            requirement.setConvertedAt(parseDateTime(item.getConvertedAt()));
            requirementsToSave.add(requirement);
        }
        if (!requirementsToSave.isEmpty()) {
            customerRequirementRepository.saveAll(requirementsToSave);
        }

        AIConversation refreshedConversation = aiConversationRepository.save(savedConversation);
        return new AIConversationIngestResponse(
                refreshedConversation.getId(),
                refreshedConversation.getSessionId(),
                existed ? "updated" : "created"
        );
    }

    public PageResponse<CustomerRequirementDTO> getRequirements(int page, int pageSize, String status, String priority, String search) {
        PageRequest pageRequest = PageRequest.of(page - 1, pageSize, Sort.by("leadScore").descending().and(Sort.by("createdAt").descending()));
        String normalizedStatus = normalize(status);
        String normalizedPriority = normalize(priority);
        String normalizedSearch = normalize(search);

        Page<CustomerRequirement> requirementPage;
        if (normalizedSearch != null) {
            requirementPage = customerRequirementRepository.search(normalizedStatus, normalizedPriority, normalizedSearch, pageRequest);
        } else if (normalizedStatus != null && normalizedPriority != null) {
            requirementPage = customerRequirementRepository.findByStatusAndPriority(normalizedStatus, normalizedPriority, pageRequest);
        } else if (normalizedStatus != null) {
            requirementPage = customerRequirementRepository.findByStatus(normalizedStatus, pageRequest);
        } else if (normalizedPriority != null) {
            requirementPage = customerRequirementRepository.findByPriority(normalizedPriority, pageRequest);
        } else {
            requirementPage = customerRequirementRepository.findAll(pageRequest);
        }

        List<CustomerRequirementDTO> items = requirementPage.getContent().stream()
                .map(this::toRequirementDto)
                .collect(Collectors.toList());

        return PageResponse.from(requirementPage, items);
    }

    @Transactional
    public CustomerRequirementDTO updateRequirementStatus(UUID id, String status) {
        CustomerRequirement requirement = customerRequirementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer requirement not found: " + id));
        requirement.setStatus(status);
        return toRequirementDto(customerRequirementRepository.save(requirement));
    }

    private void ensureConversationExists(UUID id) {
        if (!aiConversationRepository.existsById(id)) {
            throw new RuntimeException("AI conversation not found: " + id);
        }
    }

    private String defaultIfBlank(String value, String defaultValue) {
        return value == null || value.isBlank() ? defaultValue : value;
    }

    private List<ConversationMessageDTO> resolveConversationMessages(AIConversation conversation) {
        List<ConversationMessageDTO> storedMessages = conversationMessageRepository
                .findByConversationIdOrderByCreatedAtAsc(conversation.getId())
                .stream()
                .map(this::toMessageDto)
                .collect(Collectors.toList());

        if (shouldUseMetadataMessages(conversation, storedMessages)) {
            List<ConversationMessageDTO> metadataMessages = extractMessagesFromMetadata(conversation);
            if (!metadataMessages.isEmpty()) {
                return metadataMessages;
            }
        }

        return storedMessages;
    }

    private boolean shouldUseMetadataMessages(AIConversation conversation, List<ConversationMessageDTO> storedMessages) {
        Integer expectedMessageCount = conversation.getMessageCount();
        if (expectedMessageCount == null || expectedMessageCount <= storedMessages.size()) {
            return storedMessages.isEmpty();
        }
        return true;
    }

    @SuppressWarnings("unchecked")
    private List<ConversationMessageDTO> extractMessagesFromMetadata(AIConversation conversation) {
        if (conversation.getMetadata() == null) {
            return List.of();
        }

        Object rawMessages = conversation.getMetadata().get("messages");
        if (!(rawMessages instanceof List<?> rawList)) {
            return List.of();
        }

        List<ConversationMessageDTO> items = new ArrayList<>();
        for (Object rawItem : rawList) {
            if (!(rawItem instanceof Map<?, ?> rawMap)) {
                continue;
            }

            Map<String, Object> messageMap = (Map<String, Object>) rawMap;
            String content = asString(messageMap.get("content"));
            if (content == null || content.isBlank()) {
                continue;
            }

            String messageType = firstNonBlank(
                    asString(messageMap.get("messageType")),
                    asString(messageMap.get("role")),
                    "user"
            );

            String createdAt = firstNonBlank(
                    asString(messageMap.get("createdAt")),
                    asString(messageMap.get("timestamp")),
                    format(conversation.getCreatedAt())
            );

            Map<String, Object> contextData = null;
            Object products = messageMap.get("products");
            if (products instanceof List<?> productList && !productList.isEmpty()) {
                contextData = new LinkedHashMap<>();
                contextData.put("products", productList);
            }

            items.add(new ConversationMessageDTO(
                    null,
                    conversation.getId(),
                    messageType,
                    content,
                    "text",
                    null,
                    null,
                    null,
                    null,
                    contextData,
                    null,
                    createdAt
            ));
        }

        items.sort(Comparator.comparing(item -> item.getCreatedAt() == null ? "" : item.getCreatedAt()));
        return items;
    }

    private String asString(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }

    private void normalizeRequest(AIConversationIngestRequest request) {
        if (request.getUser() != null) {
            if (isBlank(request.getUserId())) {
                request.setUserId(request.getUser().getUserId());
            }
            if (isBlank(request.getUserName())) {
                request.setUserName(request.getUser().getUserName());
            }
            if (isBlank(request.getUserEmail())) {
                request.setUserEmail(request.getUser().getUserEmail());
            }
            if (isBlank(request.getUserPhone())) {
                request.setUserPhone(request.getUser().getUserPhone());
            }
            if (isBlank(request.getUserCompany())) {
                request.setUserCompany(request.getUser().getUserCompany());
            }
            if (isBlank(request.getUserJobTitle())) {
                request.setUserJobTitle(request.getUser().getUserJobTitle());
            }
        }

        if (request.getMessages() == null) {
            return;
        }

        request.setMessages(
                request.getMessages().stream()
                        .filter(Objects::nonNull)
                        .map(this::normalizeMessage)
                        .collect(Collectors.toList())
        );
    }

    private ConversationMessageIngestDTO normalizeMessage(ConversationMessageIngestDTO message) {
        message.setMessageType(defaultIfBlank(message.getMessageType(), "user"));
        message.setContentType(defaultIfBlank(message.getContentType(), "text"));
        if (isBlank(message.getCreatedAt())) {
            message.setCreatedAt(OffsetDateTime.now().toString());
        }
        return message;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String[] toArray(List<String> values) {
        if (values == null || values.isEmpty()) {
            return new String[0];
        }
        return values.stream().filter(item -> item != null && !item.isBlank()).toArray(String[]::new);
    }

    private Map<String, Object> orEmptyMap(Map<String, Object> value) {
        return value == null ? Map.of() : value;
    }

    private UUID parseUuid(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return UUID.fromString(value);
    }

    private OffsetDateTime parseDateTime(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return OffsetDateTime.parse(value);
    }

    private LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return LocalDate.parse(value);
    }

    private BigDecimal parseDecimal(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return new BigDecimal(value);
    }

    private OffsetDateTime resolveFirstMessageAt(AIConversationIngestRequest request, List<ConversationMessageIngestDTO> messages) {
        if (request.getFirstMessageAt() != null && !request.getFirstMessageAt().isBlank()) {
            return parseDateTime(request.getFirstMessageAt());
        }
        return messages.stream()
                .map(ConversationMessageIngestDTO::getCreatedAt)
                .filter(item -> item != null && !item.isBlank())
                .map(OffsetDateTime::parse)
                .min(OffsetDateTime::compareTo)
                .orElse(null);
    }

    private OffsetDateTime resolveLastMessageAt(AIConversationIngestRequest request, List<ConversationMessageIngestDTO> messages) {
        if (request.getLastMessageAt() != null && !request.getLastMessageAt().isBlank()) {
            return parseDateTime(request.getLastMessageAt());
        }
        return messages.stream()
                .map(ConversationMessageIngestDTO::getCreatedAt)
                .filter(item -> item != null && !item.isBlank())
                .map(OffsetDateTime::parse)
                .max(OffsetDateTime::compareTo)
                .orElse(null);
    }

    private AIConversation getConversationEntity(UUID id) {
        return aiConversationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("AI conversation not found: " + id));
    }

    private String normalize(String value) {
        if (value == null || value.isBlank() || "all".equalsIgnoreCase(value)) {
            return null;
        }
        return value;
    }

    private AIConversationDTO toConversationDto(AIConversation conversation) {
        AIConversationDTO dto = new AIConversationDTO();
        dto.setId(conversation.getId());
        dto.setSessionId(conversation.getSessionId());
        dto.setUserName(conversation.getUserName());
        dto.setUserEmail(conversation.getUserEmail());
        dto.setUserPhone(conversation.getUserPhone());
        dto.setUserCompany(conversation.getUserCompany());
        dto.setUserJobTitle(conversation.getUserJobTitle());
        dto.setSourcePage(conversation.getSourcePage());
        dto.setSourceUrl(conversation.getSourceUrl());
        dto.setConversationType(conversation.getConversationType());
        dto.setStatus(conversation.getStatus());
        dto.setIntentScore(conversation.getIntentScore());
        dto.setPriority(conversation.getPriority());
        dto.setExtractedNeeds(conversation.getExtractedNeeds());
        dto.setProductInterests(conversation.getProductInterests());
        dto.setBudgetRange(conversation.getBudgetRange());
        dto.setPurchaseTimeline(conversation.getPurchaseTimeline());
        dto.setMessageCount(conversation.getMessageCount());
        dto.setFirstMessageAt(format(conversation.getFirstMessageAt()));
        dto.setLastMessageAt(format(conversation.getLastMessageAt()));
        dto.setAssignedTo(conversation.getAssignedTo());
        dto.setFollowUpStatus(conversation.getFollowUpStatus());
        dto.setFollowUpNotes(conversation.getFollowUpNotes());
        dto.setFollowUpDeadline(format(conversation.getFollowUpDeadline()));
        dto.setConvertedToCustomer(conversation.getConvertedToCustomer());
        dto.setCustomerId(conversation.getCustomerId());
        dto.setMetadata(conversation.getMetadata());
        dto.setTags(conversation.getTags());
        dto.setCreatedAt(format(conversation.getCreatedAt()));
        dto.setUpdatedAt(format(conversation.getUpdatedAt()));
        dto.setRequirementCount((int) customerRequirementRepository.countByConversationId(conversation.getId()));
        return dto;
    }

    private ConversationMessageDTO toMessageDto(ConversationMessage message) {
        return new ConversationMessageDTO(
                message.getId(),
                message.getConversationId(),
                message.getMessageType(),
                message.getContent(),
                message.getContentType(),
                message.getAiModel(),
                message.getTokensUsed(),
                message.getProcessingTimeMs(),
                message.getConfidenceScore() != null ? message.getConfidenceScore().toPlainString() : null,
                message.getContextData(),
                message.getAttachments(),
                format(message.getCreatedAt())
        );
    }

    private CustomerRequirementDTO toRequirementDto(CustomerRequirement requirement) {
        return new CustomerRequirementDTO(
                requirement.getId(),
                requirement.getConversationId(),
                requirement.getCustomerName(),
                requirement.getCustomerEmail(),
                requirement.getCustomerPhone(),
                requirement.getCompanyName(),
                requirement.getJobTitle(),
                requirement.getRequirementType(),
                requirement.getProductCategory(),
                requirement.getProductNames(),
                requirement.getProductIds(),
                requirement.getQuantity(),
                requirement.getQuantityUnit(),
                requirement.getUnitPriceRange(),
                requirement.getTotalBudget(),
                requirement.getCurrency(),
                requirement.getRequiredDate() != null ? requirement.getRequiredDate().toString() : null,
                requirement.getPurchaseTimeline(),
                requirement.getUrgency(),
                requirement.getSpecifications(),
                requirement.getQualityRequirements(),
                requirement.getCertificationRequirements(),
                requirement.getCustomRequirements(),
                requirement.getShippingAddress(),
                requirement.getShippingCity(),
                requirement.getShippingState(),
                requirement.getShippingCountry(),
                requirement.getShippingPostalCode(),
                requirement.getShippingMethod(),
                requirement.getIncoterms(),
                requirement.getPaymentTerms(),
                requirement.getPaymentMethod(),
                requirement.getPriority(),
                requirement.getStatus(),
                requirement.getConfidenceScore(),
                requirement.getLeadScore(),
                requirement.getAssignedTo(),
                format(requirement.getAssignedAt()),
                requirement.getNotes(),
                format(requirement.getNextFollowUpDate()),
                requirement.getConvertedToOrder(),
                requirement.getOrderId(),
                requirement.getOrderValue() != null ? requirement.getOrderValue().toPlainString() : null,
                format(requirement.getConvertedAt()),
                format(requirement.getCreatedAt()),
                format(requirement.getUpdatedAt())
        );
    }

    private String format(java.time.temporal.TemporalAccessor value) {
        return value == null ? null : FORMATTER.format(value);
    }

    private void copyConversationFields(AIConversationDTO source, AIConversationDetailDTO target) {
        target.setId(source.getId());
        target.setSessionId(source.getSessionId());
        target.setUserName(source.getUserName());
        target.setUserEmail(source.getUserEmail());
        target.setUserPhone(source.getUserPhone());
        target.setUserCompany(source.getUserCompany());
        target.setUserJobTitle(source.getUserJobTitle());
        target.setSourcePage(source.getSourcePage());
        target.setSourceUrl(source.getSourceUrl());
        target.setConversationType(source.getConversationType());
        target.setStatus(source.getStatus());
        target.setIntentScore(source.getIntentScore());
        target.setPriority(source.getPriority());
        target.setExtractedNeeds(source.getExtractedNeeds());
        target.setProductInterests(source.getProductInterests());
        target.setBudgetRange(source.getBudgetRange());
        target.setPurchaseTimeline(source.getPurchaseTimeline());
        target.setMessageCount(source.getMessageCount());
        target.setFirstMessageAt(source.getFirstMessageAt());
        target.setLastMessageAt(source.getLastMessageAt());
        target.setAssignedTo(source.getAssignedTo());
        target.setFollowUpStatus(source.getFollowUpStatus());
        target.setFollowUpNotes(source.getFollowUpNotes());
        target.setFollowUpDeadline(source.getFollowUpDeadline());
        target.setConvertedToCustomer(source.getConvertedToCustomer());
        target.setCustomerId(source.getCustomerId());
        target.setMetadata(source.getMetadata());
        target.setTags(source.getTags());
        target.setCreatedAt(source.getCreatedAt());
        target.setUpdatedAt(source.getUpdatedAt());
        target.setRequirementCount(source.getRequirementCount());
    }
}
