package com.machrio.admin.service;

import com.machrio.admin.dto.CategoryDTO;
import com.machrio.admin.dto.CreateCategoryRequest;
import com.machrio.admin.dto.PageResponse;
import com.machrio.admin.entity.Category;
import com.machrio.admin.repository.CategoryRepository;
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
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'").withZone(ZoneId.of("UTC"));

    public PageResponse<CategoryDTO> getAllCategories(int page, int pageSize, String status, String search) {
        PageRequest pageRequest = PageRequest.of(page - 1, pageSize, Sort.by("displayOrder").ascending());

        Page<Category> categoryPage;
        if (search != null && !search.isBlank()) {
            categoryPage = categoryRepository.findAll(pageRequest);
        } else if (status != null && !status.isBlank()) {
            categoryPage = categoryRepository.findByStatus(status, pageRequest);
        } else {
            categoryPage = categoryRepository.findAll(pageRequest);
        }

        List<CategoryDTO> dtos = categoryPage.getContent().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return PageResponse.from(categoryPage, dtos);
    }

    public List<CategoryDTO> getTopLevelCategories() {
        return categoryRepository.findTopLevelCategories().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<CategoryDTO> getSubcategories(UUID parentId) {
        return categoryRepository.findByParentIdOrderByDisplayOrderAsc(parentId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public CategoryDTO getCategoryById(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found: " + id));
        return toDTO(category);
    }

    /**
     * 根据名称和父ID查找分类（用于批量上传匹配分类）
     */
    public CategoryDTO findByNameAndParentId(String name, UUID parentId) {
        Category category;
        if (parentId == null) {
            category = categoryRepository.findByNameAndParentIdIsNull(name).orElse(null);
        } else {
            category = categoryRepository.findByNameAndParentId(name, parentId).orElse(null);
        }
        return category != null ? toDTO(category) : null;
    }

    @Transactional
    public CategoryDTO createCategory(CreateCategoryRequest request) {
        Category category = new Category();
        updateCategoryFromRequest(category, request);
        category = categoryRepository.save(category);
        return toDTO(category);
    }

    @Transactional
    public CategoryDTO updateCategory(UUID id, CreateCategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found: " + id));
        updateCategoryFromRequest(category, request);
        category = categoryRepository.save(category);
        return toDTO(category);
    }

    @Transactional
    public void deleteCategory(UUID id) {
        if (!categoryRepository.existsById(id)) {
            throw new RuntimeException("Category not found: " + id);
        }
        categoryRepository.deleteById(id);
    }

    private void updateCategoryFromRequest(Category category, CreateCategoryRequest request) {
        category.setName(request.getName());
        category.setSlug(request.getSlug());
        category.setDescription(request.getDescription());
        category.setShortDescription(request.getShortDescription());
        category.setParentId(request.getParentId());
        category.setLevel(request.getLevel() != null ? request.getLevel() : 1);
        category.setDisplayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0);
        category.setImage(request.getImage());
        category.setIcon(request.getIcon());
        category.setIconEmoji(request.getIconEmoji());
        category.setFeatured(request.getFeatured() != null ? request.getFeatured() : false);
        category.setStatus(request.getStatus() != null ? request.getStatus() : "published");
        category.setMetaTitle(request.getMetaTitle());
        category.setMetaDescription(request.getMetaDescription());
        category.setIntroContent(request.getIntroContent());
        category.setFaq(request.getFaq());
        category.setFacetGroups(request.getFacetGroups());
        category.setSeo(request.getSeo());
        category.setSeoContent(request.getSeoContent());
        category.setBuyingGuide(request.getBuyingGuide());
        category.setMeta(request.getMeta());
        category.setCustomFields(request.getCustomFields());
        category.setHeroImageId(request.getHeroImageId());
        category.setIconId(request.getIconId());
    }

    private CategoryDTO toDTO(Category category) {
        CategoryDTO dto = new CategoryDTO();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setSlug(category.getSlug());
        dto.setDescription(category.getDescription());
        dto.setShortDescription(category.getShortDescription());
        dto.setParentId(category.getParentId());
        dto.setLevel(category.getLevel());
        dto.setDisplayOrder(category.getDisplayOrder());
        dto.setImage(category.getImage());
        dto.setIcon(category.getIcon());
        dto.setIconEmoji(category.getIconEmoji());
        dto.setFeatured(category.getFeatured());
        dto.setStatus(category.getStatus());
        dto.setMetaTitle(category.getMetaTitle());
        dto.setMetaDescription(category.getMetaDescription());
        dto.setIntroContent(category.getIntroContent());
        dto.setFaq(category.getFaq());
        dto.setFacetGroups(category.getFacetGroups());
        dto.setSeo(category.getSeo());
        dto.setSeoContent(category.getSeoContent());
        dto.setBuyingGuide(category.getBuyingGuide());
        dto.setMeta(category.getMeta());
        dto.setCustomFields(category.getCustomFields());
        dto.setHeroImageId(category.getHeroImageId());
        dto.setIconId(category.getIconId());
        dto.setCreatedAt(category.getCreatedAt() != null ? FORMATTER.format(category.getCreatedAt()) : null);
        dto.setUpdatedAt(category.getUpdatedAt() != null ? FORMATTER.format(category.getUpdatedAt()) : null);
        return dto;
    }
}
