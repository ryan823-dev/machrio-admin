package com.machrio.admin.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.machrio.admin.dto.SmsMessageDTO;
import com.machrio.admin.dto.SmsNumberDTO;
import com.machrio.admin.entity.SmsMessage;
import com.machrio.admin.entity.SmsNumber;
import com.machrio.admin.repository.SmsMessageRepository;
import com.machrio.admin.repository.SmsNumberRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class SmsService {

    private static final Logger logger = LoggerFactory.getLogger(SmsService.class);
    private static final String API_BASE_URL = "https://receive-sms.com/api/v1";

    private final SmsMessageRepository smsMessageRepository;
    private final SmsNumberRepository smsNumberRepository;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    @Value("${sms.api.key:qbCsjhZ8MsQAJCD3ELkRkiLJDYnO5NZI}")
    private String apiKey;

    @Value("${sms.sync.enabled:true}")
    private boolean syncEnabled;

    public SmsService(SmsMessageRepository smsMessageRepository, SmsNumberRepository smsNumberRepository) {
        this.smsMessageRepository = smsMessageRepository;
        this.smsNumberRepository = smsNumberRepository;
        this.objectMapper = new ObjectMapper();
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(java.time.Duration.ofSeconds(10))
                .build();
    }

    // ============ SMS Messages ============

    public Page<SmsMessageDTO> getMessages(String phoneNumber, String status, String keyword, Pageable pageable) {
        Page<SmsMessage> messages;

        if (keyword != null && !keyword.isEmpty()) {
            messages = smsMessageRepository.searchByKeyword(keyword, pageable);
        } else if (phoneNumber != null && status != null) {
            messages = smsMessageRepository.findByPhoneNumberAndStatus(phoneNumber, status, pageable);
        } else if (phoneNumber != null) {
            messages = smsMessageRepository.findByPhoneNumber(phoneNumber, pageable);
        } else if (status != null) {
            messages = smsMessageRepository.findByStatus(status, pageable);
        } else {
            messages = smsMessageRepository.findAll(pageable);
        }

        return messages.map(this::toMessageDTO);
    }

    public Optional<SmsMessageDTO> getMessageById(String id) {
        return smsMessageRepository.findById(java.util.UUID.fromString(id))
                .map(this::toMessageDTO);
    }

    @Transactional
    public void markAsRead(String id) {
        smsMessageRepository.findById(java.util.UUID.fromString(id))
                .ifPresent(msg -> {
                    msg.setStatus("read");
                    smsMessageRepository.save(msg);
                });
    }

    @Transactional
    public void deleteMessage(String id) {
        smsMessageRepository.deleteById(java.util.UUID.fromString(id));
    }

    public Map<String, Long> getMessageStats() {
        long total = smsMessageRepository.count();
        long unread = smsMessageRepository.countByStatus("unread");
        long read = smsMessageRepository.countByStatus("read");
        return Map.of("total", total, "unread", unread, "read", read);
    }

    // ============ SMS Numbers ============

    public List<SmsNumberDTO> getNumbers() {
        return smsNumberRepository.findAll().stream()
                .map(this::toNumberDTO)
                .toList();
    }

    // ============ API Integration ============

    /**
     * Fetch messages from receive-sms.com API and sync to local database
     */
    @Scheduled(fixedRate = 60000) // Every minute
    @Transactional
    public void syncMessagesFromApi() {
        if (!syncEnabled) {
            return;
        }

        try {
            // Get all active phone numbers
            List<SmsNumber> numbers = smsNumberRepository.findAll();

            for (SmsNumber number : numbers) {
                if (number.getActive()) {
                    fetchMessagesForNumber(number.getPhoneNumber());
                }
            }
        } catch (Exception e) {
            logger.error("Failed to sync SMS messages: {}", e.getMessage());
        }
    }

    public void fetchMessagesForNumber(String phoneNumber) {
        try {
            String url = API_BASE_URL + "/numbers/" + phoneNumber + "/sms?limit=100";
            String response = makeApiRequest(url);

            if (response != null) {
                JsonNode root = objectMapper.readTree(response);
                JsonNode messages = root.path("messages");

                if (messages.isArray()) {
                    for (JsonNode msg : messages) {
                        saveMessageFromApi(phoneNumber, msg);
                    }
                }
            }
        } catch (Exception e) {
            logger.error("Failed to fetch messages for {}: {}", phoneNumber, e.getMessage());
        }
    }

    private void saveMessageFromApi(String phoneNumber, JsonNode msg) {
        String externalId = msg.path("time").asText() + "_" + msg.path("from").asText();

        // Check if message already exists
        if (smsMessageRepository.existsByExternalId(externalId)) {
            return;
        }

        SmsMessage message = new SmsMessage();
        message.setPhoneNumber(phoneNumber);
        message.setSenderNumber(msg.path("from").asText());
        message.setMessage(msg.path("message").asText());
        message.setExternalId(externalId);
        message.setStatus("unread");

        // Parse time
        String timeStr = msg.path("time").asText();
        try {
            message.setReceivedAt(OffsetDateTime.parse(timeStr, DateTimeFormatter.ISO_OFFSET_DATE_TIME));
        } catch (Exception e) {
            message.setReceivedAt(OffsetDateTime.now());
        }

        smsMessageRepository.save(message);
        logger.info("Saved new SMS from {} to {}", message.getSenderNumber(), phoneNumber);
    }

    public String fetchBalanceFromApi() {
        try {
            String url = API_BASE_URL + "/balance";
            String response = makeApiRequest(url);

            if (response != null) {
                JsonNode root = objectMapper.readTree(response);
                return root.path("balance").asText();
            }
        } catch (Exception e) {
            logger.error("Failed to fetch balance: {}", e.getMessage());
        }
        return null;
    }

    public void syncNumbersFromApi() {
        try {
            String url = API_BASE_URL + "/numbers";
            String response = makeApiRequest(url);

            if (response != null) {
                JsonNode root = objectMapper.readTree(response);
                JsonNode numbers = root.path("numbers");

                if (numbers.isArray()) {
                    for (JsonNode num : numbers) {
                        saveNumberFromApi(num);
                    }
                }
            }
        } catch (Exception e) {
            logger.error("Failed to sync numbers: {}", e.getMessage());
        }
    }

    private void saveNumberFromApi(JsonNode num) {
        String phoneNumber = num.path("phone_number").asText();

        SmsNumber number = smsNumberRepository.findByPhoneNumber(phoneNumber)
                .orElseGet(() -> {
                    SmsNumber newNumber = new SmsNumber();
                    newNumber.setPhoneNumber(phoneNumber);
                    return newNumber;
                });

        number.setCountryCode(num.path("country_code").asText());
        number.setPlan(num.path("plan").asText());
        number.setAutoRenew(num.path("auto_renew").asBoolean());
        number.setMessageCount(num.path("message_count").asInt());
        number.setActive(true);

        // Parse dates
        try {
            if (num.has("rented_at")) {
                number.setRentedAt(OffsetDateTime.parse(num.path("rented_at").asText()));
            }
            if (num.has("expiration_date")) {
                number.setExpirationDate(OffsetDateTime.parse(num.path("expiration_date").asText()));
            }
            if (num.has("last_sms_received_date") && !num.path("last_sms_received_date").isNull()) {
                number.setLastSmsReceivedDate(OffsetDateTime.parse(num.path("last_sms_received_date").asText()));
            }
        } catch (Exception e) {
            logger.warn("Failed to parse date for number {}: {}", phoneNumber, e.getMessage());
        }

        smsNumberRepository.save(number);
        logger.info("Synced number: {}", phoneNumber);
    }

    private String makeApiRequest(String url) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Authorization", "Bearer " + apiKey)
                .header("Accept", "application/json")
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() == 200) {
            return response.body();
        } else {
            logger.warn("API request failed with status {}: {}", response.statusCode(), response.body());
            return null;
        }
    }

    // ============ DTO Conversion ============

    private SmsMessageDTO toMessageDTO(SmsMessage msg) {
        return new SmsMessageDTO(
                msg.getId(),
                msg.getPhoneNumber(),
                msg.getSenderNumber(),
                msg.getMessage(),
                msg.getReceivedAt(),
                msg.getStatus(),
                msg.getCreatedAt()
        );
    }

    private SmsNumberDTO toNumberDTO(SmsNumber num) {
        return new SmsNumberDTO(
                num.getId(),
                num.getPhoneNumber(),
                num.getCountryCode(),
                num.getRentedAt(),
                num.getExpirationDate(),
                num.getPlan(),
                num.getAutoRenew(),
                num.getMessageCount(),
                num.getLastSmsReceivedDate(),
                num.getActive()
        );
    }
}