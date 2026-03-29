package com.machrio.admin.service;

import com.machrio.admin.dto.PageResponse;
import com.machrio.admin.dto.RfqSubmissionDTO;
import com.machrio.admin.entity.RfqSubmission;
import com.machrio.admin.repository.RfqSubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RfqSubmissionService {

    private final RfqSubmissionRepository rfqSubmissionRepository;
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'").withZone(ZoneId.of("UTC"));

    public PageResponse<RfqSubmissionDTO> getAllSubmissions(int page, int pageSize, String status) {
        PageRequest pageRequest = PageRequest.of(page - 1, pageSize, Sort.by("submittedAt").descending());

        Page<RfqSubmission> submissionPage;
        if (status != null && !status.isBlank()) {
            submissionPage = rfqSubmissionRepository.findByStatus(status, pageRequest);
        } else {
            submissionPage = rfqSubmissionRepository.findAll(pageRequest);
        }

        List<RfqSubmissionDTO> dtos = submissionPage.getContent().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return PageResponse.from(submissionPage, dtos);
    }

    public RfqSubmissionDTO getSubmissionById(UUID id) {
        RfqSubmission submission = rfqSubmissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("RFQ Submission not found: " + id));
        return toDTO(submission);
    }

    @Transactional
    public RfqSubmissionDTO updateStatus(UUID id, String status) {
        RfqSubmission submission = rfqSubmissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("RFQ Submission not found: " + id));
        submission.setStatus(status);
        return toDTO(rfqSubmissionRepository.save(submission));
    }

    @Transactional
    public RfqSubmissionDTO updateNotes(UUID id, String notes) {
        RfqSubmission submission = rfqSubmissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("RFQ Submission not found: " + id));
        submission.setNotes(notes);
        return toDTO(rfqSubmissionRepository.save(submission));
    }

    @Transactional
    public RfqSubmissionDTO updateStatusAndNotes(UUID id, String status, String notes) {
        RfqSubmission submission = rfqSubmissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("RFQ Submission not found: " + id));
        if (status != null) {
            submission.setStatus(status);
        }
        if (notes != null) {
            submission.setNotes(notes);
        }
        return toDTO(rfqSubmissionRepository.save(submission));
    }

    @Transactional
    public void deleteSubmission(UUID id) {
        if (!rfqSubmissionRepository.existsById(id)) {
            throw new RuntimeException("RFQ Submission not found: " + id);
        }
        rfqSubmissionRepository.deleteById(id);
    }

    private RfqSubmissionDTO toDTO(RfqSubmission submission) {
        RfqSubmissionDTO dto = new RfqSubmissionDTO();
        dto.setId(submission.getId());
        dto.setSubmittedAt(submission.getSubmittedAt() != null ? FORMATTER.format(submission.getSubmittedAt()) : null);
        dto.setCustomer(submission.getCustomer());
        dto.setInquiry(submission.getInquiry());
        dto.setCustomerRefId(submission.getCustomerRefId());
        dto.setStatus(submission.getStatus());
        dto.setNotes(submission.getNotes());
        dto.setSource(submission.getSource());
        dto.setCreatedAt(submission.getCreatedAt() != null ? FORMATTER.format(submission.getCreatedAt()) : null);
        dto.setUpdatedAt(submission.getUpdatedAt() != null ? FORMATTER.format(submission.getUpdatedAt()) : null);
        return dto;
    }
}
