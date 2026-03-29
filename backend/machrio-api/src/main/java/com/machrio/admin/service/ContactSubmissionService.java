package com.machrio.admin.service;

import com.machrio.admin.dto.PageResponse;
import com.machrio.admin.dto.ContactSubmissionDTO;
import com.machrio.admin.entity.ContactSubmission;
import com.machrio.admin.repository.ContactSubmissionRepository;
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
public class ContactSubmissionService {

    private final ContactSubmissionRepository contactSubmissionRepository;
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'").withZone(ZoneId.of("UTC"));

    public PageResponse<ContactSubmissionDTO> getAllSubmissions(int page, int pageSize, String status, String search) {
        PageRequest pageRequest = PageRequest.of(page - 1, pageSize, Sort.by("submittedAt").descending());

        Page<ContactSubmission> submissionPage;
        if (search != null && !search.isBlank()) {
            submissionPage = contactSubmissionRepository.searchByKeyword(search, pageRequest);
        } else if (status != null && !status.isBlank()) {
            submissionPage = contactSubmissionRepository.findByStatus(status, pageRequest);
        } else {
            submissionPage = contactSubmissionRepository.findAll(pageRequest);
        }

        List<ContactSubmissionDTO> dtos = submissionPage.getContent().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return PageResponse.from(submissionPage, dtos);
    }

    public ContactSubmissionDTO getSubmissionById(UUID id) {
        ContactSubmission submission = contactSubmissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contact Submission not found: " + id));
        return toDTO(submission);
    }

    @Transactional
    public ContactSubmissionDTO updateStatus(UUID id, String status) {
        ContactSubmission submission = contactSubmissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contact Submission not found: " + id));
        submission.setStatus(status);
        return toDTO(contactSubmissionRepository.save(submission));
    }

    @Transactional
    public ContactSubmissionDTO updateNotes(UUID id, String notes) {
        ContactSubmission submission = contactSubmissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contact Submission not found: " + id));
        submission.setNotes(notes);
        return toDTO(contactSubmissionRepository.save(submission));
    }

    @Transactional
    public ContactSubmissionDTO updateStatusAndNotes(UUID id, String status, String notes) {
        ContactSubmission submission = contactSubmissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contact Submission not found: " + id));
        if (status != null) {
            submission.setStatus(status);
        }
        if (notes != null) {
            submission.setNotes(notes);
        }
        return toDTO(contactSubmissionRepository.save(submission));
    }

    @Transactional
    public void deleteSubmission(UUID id) {
        if (!contactSubmissionRepository.existsById(id)) {
            throw new RuntimeException("Contact Submission not found: " + id);
        }
        contactSubmissionRepository.deleteById(id);
    }

    private ContactSubmissionDTO toDTO(ContactSubmission submission) {
        ContactSubmissionDTO dto = new ContactSubmissionDTO();
        dto.setId(submission.getId());
        dto.setSubmittedAt(submission.getSubmittedAt() != null ? FORMATTER.format(submission.getSubmittedAt()) : null);
        dto.setName(submission.getName());
        dto.setEmail(submission.getEmail());
        dto.setPhone(submission.getPhone());
        dto.setCompany(submission.getCompany());
        dto.setSubject(submission.getSubject());
        dto.setMessage(submission.getMessage());
        dto.setStatus(submission.getStatus());
        dto.setNotes(submission.getNotes());
        dto.setCreatedAt(submission.getCreatedAt() != null ? FORMATTER.format(submission.getCreatedAt()) : null);
        dto.setUpdatedAt(submission.getUpdatedAt() != null ? FORMATTER.format(submission.getUpdatedAt()) : null);
        return dto;
    }
}
