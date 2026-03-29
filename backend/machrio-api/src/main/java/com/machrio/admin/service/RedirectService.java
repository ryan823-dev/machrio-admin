package com.machrio.admin.service;

import com.machrio.admin.dto.CreateRedirectRequest;
import com.machrio.admin.dto.RedirectDTO;
import com.machrio.admin.dto.PageResponse;
import com.machrio.admin.entity.Redirect;
import com.machrio.admin.repository.RedirectRepository;
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
public class RedirectService {

    private final RedirectRepository redirectRepository;
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'").withZone(ZoneId.of("UTC"));

    public PageResponse<RedirectDTO> getAllRedirects(int page, int pageSize, String search) {
        PageRequest pageRequest = PageRequest.of(page - 1, pageSize, Sort.by("createdAt").descending());

        Page<Redirect> redirectPage;
        if (search != null && !search.isBlank()) {
            redirectPage = redirectRepository.searchByKeyword(search, pageRequest);
        } else {
            redirectPage = redirectRepository.findAll(pageRequest);
        }

        List<RedirectDTO> dtos = redirectPage.getContent().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return PageResponse.from(redirectPage, dtos);
    }

    public List<RedirectDTO> getActiveRedirects() {
        return redirectRepository.findByActiveTrueOrderByCreatedAtDesc().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public RedirectDTO getRedirectById(UUID id) {
        Redirect redirect = redirectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Redirect not found: " + id));
        return toDTO(redirect);
    }

    public RedirectDTO getRedirectBySourceUrl(String sourceUrl) {
        Redirect redirect = redirectRepository.findBySourceUrl(sourceUrl)
                .orElseThrow(() -> new RuntimeException("Redirect not found with source URL: " + sourceUrl));
        return toDTO(redirect);
    }

    @Transactional
    public RedirectDTO createRedirect(CreateRedirectRequest request) {
        if (redirectRepository.existsBySourceUrl(request.getSourceUrl())) {
            throw new RuntimeException("Redirect with source URL already exists: " + request.getSourceUrl());
        }

        Redirect redirect = new Redirect();
        updateRedirectFromRequest(redirect, request);
        redirect = redirectRepository.save(redirect);
        return toDTO(redirect);
    }

    @Transactional
    public RedirectDTO updateRedirect(UUID id, CreateRedirectRequest request) {
        Redirect redirect = redirectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Redirect not found: " + id));

        if (!redirect.getSourceUrl().equals(request.getSourceUrl()) && redirectRepository.existsBySourceUrl(request.getSourceUrl())) {
            throw new RuntimeException("Redirect with source URL already exists: " + request.getSourceUrl());
        }

        updateRedirectFromRequest(redirect, request);
        redirect = redirectRepository.save(redirect);
        return toDTO(redirect);
    }

    @Transactional
    public void deleteRedirect(UUID id) {
        if (!redirectRepository.existsById(id)) {
            throw new RuntimeException("Redirect not found: " + id);
        }
        redirectRepository.deleteById(id);
    }

    private void updateRedirectFromRequest(Redirect redirect, CreateRedirectRequest request) {
        redirect.setSourceUrl(request.getSourceUrl());
        redirect.setDestinationUrl(request.getDestinationUrl());
        if (request.getType() != null) {
            redirect.setType(Redirect.RedirectType.valueOf(request.getType()));
        }
        if (request.getActive() != null) {
            redirect.setActive(request.getActive());
        }
    }

    private RedirectDTO toDTO(Redirect redirect) {
        RedirectDTO dto = new RedirectDTO();
        dto.setId(redirect.getId());
        dto.setSourceUrl(redirect.getSourceUrl());
        dto.setDestinationUrl(redirect.getDestinationUrl());
        dto.setType(redirect.getType().name());
        dto.setActive(redirect.getActive());
        dto.setCreatedAt(redirect.getCreatedAt() != null ? FORMATTER.format(redirect.getCreatedAt()) : null);
        dto.setUpdatedAt(redirect.getUpdatedAt() != null ? FORMATTER.format(redirect.getUpdatedAt()) : null);
        return dto;
    }
}
