package com.machrio.admin.service;

import com.machrio.admin.dto.ArticleContentDTO;
import com.machrio.admin.dto.CreateArticleRequest;
import com.machrio.admin.dto.ArticleDTO;
import com.machrio.admin.dto.PageResponse;
import com.machrio.admin.entity.Article;
import com.machrio.admin.repository.ArticleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ArticleService {

    private final ArticleRepository articleRepository;
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'").withZone(ZoneId.of("UTC"));

    public PageResponse<ArticleDTO> getAllArticles(int page, int pageSize, String search, String category) {
        PageRequest pageRequest = PageRequest.of(page - 1, pageSize, Sort.by("displayOrder").ascending().and(Sort.by("publishedAt").descending()));

        Page<Article> articlePage;
        if (search != null && !search.isBlank()) {
            articlePage = articleRepository.searchByKeyword(search, pageRequest);
        } else if (category != null && !category.isBlank()) {
            articlePage = articleRepository.findByCategorySlug(category, pageRequest);
        } else {
            articlePage = articleRepository.findAll(pageRequest);
        }

        List<ArticleDTO> dtos = articlePage.getContent().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return PageResponse.from(articlePage, dtos);
    }

    public List<ArticleDTO> getFeaturedArticles() {
        return articleRepository.findByFeaturedTrueOrderByPublishedAtDesc().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<ArticleDTO> getArticlesByCategory(String categorySlug) {
        return articleRepository.findByCategorySlugOrderByDisplayOrderAscPublishedAtDesc(categorySlug).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public ArticleDTO getArticleById(UUID id) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Article not found: " + id));
        return toDTO(article);
    }

    public ArticleDTO getArticleBySlug(String slug) {
        Article article = articleRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Article not found with slug: " + slug));
        return toDTO(article);
    }

    @Transactional
    public ArticleDTO createArticle(CreateArticleRequest request) {
        if (articleRepository.existsBySlug(request.getSlug())) {
            throw new RuntimeException("Article with slug already exists: " + request.getSlug());
        }

        Article article = new Article();
        updateArticleFromRequest(article, request);
        if (Article.ArticleStatus.published.name().equals(request.getStatus()) && article.getPublishedAt() == null) {
            article.setPublishedAt(OffsetDateTime.now());
        }
        article = articleRepository.save(article);
        return toDTO(article);
    }

    @Transactional
    public ArticleDTO updateArticle(UUID id, CreateArticleRequest request) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Article not found: " + id));

        if (!article.getSlug().equals(request.getSlug()) && articleRepository.existsBySlug(request.getSlug())) {
            throw new RuntimeException("Article with slug already exists: " + request.getSlug());
        }

        Article.ArticleStatus oldStatus = article.getStatus();
        updateArticleFromRequest(article, request);
        
        if (Article.ArticleStatus.published.name().equals(request.getStatus()) && 
            (oldStatus != Article.ArticleStatus.published || article.getPublishedAt() == null)) {
            article.setPublishedAt(OffsetDateTime.now());
        }
        
        article = articleRepository.save(article);
        return toDTO(article);
    }

    @Transactional
    public void deleteArticle(UUID id) {
        if (!articleRepository.existsById(id)) {
            throw new RuntimeException("Article not found: " + id);
        }
        articleRepository.deleteById(id);
    }

    private void updateArticleFromRequest(Article article, CreateArticleRequest request) {
        article.setTitle(request.getTitle());
        article.setSlug(request.getSlug());
        article.setShortDescription(request.getShortDescription());
        
        if (request.getContent() != null) {
            Article.ArticleContent content = new Article.ArticleContent();
            content.setHtml(request.getContent().getHtml());
            content.setText(request.getContent().getText());
            article.setContent(content);
        }
        
        article.setCoverImageUrl(request.getCoverImageUrl());
        article.setAuthor(request.getAuthor());
        article.setTags(request.getTags());
        article.setCategorySlug(request.getCategorySlug());
        article.setMetaTitle(request.getMetaTitle());
        article.setMetaDescription(request.getMetaDescription());
        article.setFeatured(request.getFeatured());
        if (request.getStatus() != null) {
            article.setStatus(Article.ArticleStatus.valueOf(request.getStatus()));
        }
        article.setDisplayOrder(request.getDisplayOrder());
    }

    private ArticleDTO toDTO(Article article) {
        ArticleDTO dto = new ArticleDTO();
        dto.setId(article.getId());
        dto.setTitle(article.getTitle());
        dto.setSlug(article.getSlug());
        dto.setShortDescription(article.getShortDescription());
        
        if (article.getContent() != null) {
            ArticleContentDTO content = new ArticleContentDTO();
            content.setHtml(article.getContent().getHtml());
            content.setText(article.getContent().getText());
            dto.setContent(content);
        }
        
        dto.setCoverImageUrl(article.getCoverImageUrl());
        dto.setAuthor(article.getAuthor());
        dto.setTags(article.getTags());
        dto.setCategorySlug(article.getCategorySlug());
        dto.setMetaTitle(article.getMetaTitle());
        dto.setMetaDescription(article.getMetaDescription());
        dto.setFeatured(article.getFeatured());
        dto.setStatus(article.getStatus().name());
        dto.setDisplayOrder(article.getDisplayOrder());
        dto.setPublishedAt(article.getPublishedAt() != null ? FORMATTER.format(article.getPublishedAt()) : null);
        dto.setCreatedAt(article.getCreatedAt() != null ? FORMATTER.format(article.getCreatedAt()) : null);
        dto.setUpdatedAt(article.getUpdatedAt() != null ? FORMATTER.format(article.getUpdatedAt()) : null);
        return dto;
    }
}
