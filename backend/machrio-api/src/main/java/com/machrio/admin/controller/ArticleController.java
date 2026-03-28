package com.machrio.admin.controller;

import com.machrio.admin.dto.ApiResponse;
import com.machrio.admin.dto.CreateArticleRequest;
import com.machrio.admin.dto.ArticleDTO;
import com.machrio.admin.dto.PageResponse;
import com.machrio.admin.service.ArticleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/articles")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ArticleController {

    private final ArticleService articleService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ArticleDTO>>> getAllArticles(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category) {
        PageResponse<ArticleDTO> result = articleService.getAllArticles(page, pageSize, search, category);
        return ResponseEntity.ok(ApiResponse.success(result, result.getTotalItems()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ArticleDTO>> getArticleById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(articleService.getArticleById(id)));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<ArticleDTO>> getArticleBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.success(articleService.getArticleBySlug(slug)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ArticleDTO>> createArticle(@Valid @RequestBody CreateArticleRequest request) {
        ArticleDTO article = articleService.createArticle(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(article, "Article created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ArticleDTO>> updateArticle(@PathVariable UUID id, @Valid @RequestBody CreateArticleRequest request) {
        return ResponseEntity.ok(ApiResponse.success(articleService.updateArticle(id, request), "Article updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteArticle(@PathVariable UUID id) {
        articleService.deleteArticle(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Article deleted successfully"));
    }
}
