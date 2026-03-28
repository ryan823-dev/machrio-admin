package com.machrio.admin.service;

import com.machrio.admin.dto.CreateGlossaryTermRequest;
import com.machrio.admin.dto.GlossaryTermDTO;
import com.machrio.admin.dto.PageResponse;
import com.machrio.admin.entity.GlossaryTerm;
import com.machrio.admin.repository.GlossaryTermRepository;
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
public class GlossaryTermService {

    private final GlossaryTermRepository glossaryTermRepository;
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'").withZone(ZoneId.of("UTC"));

    public PageResponse<GlossaryTermDTO> getAllGlossaryTerms(int page, int pageSize, String search, String category) {
        PageRequest pageRequest = PageRequest.of(page - 1, pageSize, Sort.by("displayOrder").ascending().and(Sort.by("term").ascending()));

        Page<GlossaryTerm> termPage;
        if (search != null && !search.isBlank()) {
            termPage = glossaryTermRepository.searchByKeyword(search, pageRequest);
        } else if (category != null && !category.isBlank()) {
            termPage = glossaryTermRepository.findByCategorySlug(category, pageRequest);
        } else {
            termPage = glossaryTermRepository.findAll(pageRequest);
        }

        List<GlossaryTermDTO> dtos = termPage.getContent().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return PageResponse.from(termPage, dtos);
    }

    public List<GlossaryTermDTO> getTermsByCategory(String categorySlug) {
        return glossaryTermRepository.findByCategorySlugOrderByDisplayOrderAscTermAsc(categorySlug).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public GlossaryTermDTO getGlossaryTermById(UUID id) {
        GlossaryTerm term = glossaryTermRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Glossary term not found: " + id));
        return toDTO(term);
    }

    public GlossaryTermDTO getGlossaryTermBySlug(String slug) {
        GlossaryTerm term = glossaryTermRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Glossary term not found with slug: " + slug));
        return toDTO(term);
    }

    @Transactional
    public GlossaryTermDTO createGlossaryTerm(CreateGlossaryTermRequest request) {
        if (glossaryTermRepository.existsBySlug(request.getSlug())) {
            throw new RuntimeException("Glossary term with slug already exists: " + request.getSlug());
        }

        GlossaryTerm term = new GlossaryTerm();
        updateGlossaryTermFromRequest(term, request);
        term = glossaryTermRepository.save(term);
        return toDTO(term);
    }

    @Transactional
    public GlossaryTermDTO updateGlossaryTerm(UUID id, CreateGlossaryTermRequest request) {
        GlossaryTerm term = glossaryTermRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Glossary term not found: " + id));

        if (!term.getSlug().equals(request.getSlug()) && glossaryTermRepository.existsBySlug(request.getSlug())) {
            throw new RuntimeException("Glossary term with slug already exists: " + request.getSlug());
        }

        updateGlossaryTermFromRequest(term, request);
        term = glossaryTermRepository.save(term);
        return toDTO(term);
    }

    @Transactional
    public void deleteGlossaryTerm(UUID id) {
        if (!glossaryTermRepository.existsById(id)) {
            throw new RuntimeException("Glossary term not found: " + id);
        }
        glossaryTermRepository.deleteById(id);
    }

    private void updateGlossaryTermFromRequest(GlossaryTerm term, CreateGlossaryTermRequest request) {
        term.setTerm(request.getTerm());
        term.setSlug(request.getSlug());
        term.setShortDefinition(request.getShortDefinition());
        term.setFullDescription(request.getFullDescription());
        term.setSynonyms(request.getSynonyms());
        term.setRelatedTerms(request.getRelatedTerms());
        term.setCategorySlug(request.getCategorySlug());
        term.setMetaTitle(request.getMetaTitle());
        term.setMetaDescription(request.getMetaDescription());
        if (request.getStatus() != null) {
            term.setStatus(GlossaryTerm.GlossaryStatus.valueOf(request.getStatus()));
        }
        term.setDisplayOrder(request.getDisplayOrder());
    }

    private GlossaryTermDTO toDTO(GlossaryTerm term) {
        GlossaryTermDTO dto = new GlossaryTermDTO();
        dto.setId(term.getId());
        dto.setTerm(term.getTerm());
        dto.setSlug(term.getSlug());
        dto.setShortDefinition(term.getShortDefinition());
        dto.setFullDescription(term.getFullDescription());
        dto.setSynonyms(term.getSynonyms());
        dto.setRelatedTerms(term.getRelatedTerms());
        dto.setCategorySlug(term.getCategorySlug());
        dto.setMetaTitle(term.getMetaTitle());
        dto.setMetaDescription(term.getMetaDescription());
        dto.setStatus(term.getStatus().name());
        dto.setDisplayOrder(term.getDisplayOrder());
        dto.setCreatedAt(term.getCreatedAt() != null ? FORMATTER.format(term.getCreatedAt()) : null);
        dto.setUpdatedAt(term.getUpdatedAt() != null ? FORMATTER.format(term.getUpdatedAt()) : null);
        return dto;
    }
}
