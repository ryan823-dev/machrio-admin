package com.machrio.admin.repository;

import com.machrio.admin.entity.Article;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ArticleRepository extends JpaRepository<Article, UUID> {
    Optional<Article> findBySlug(String slug);
    boolean existsBySlug(String slug);
    List<Article> findByFeaturedTrueOrderByPublishedAtDesc();
    List<Article> findByCategorySlugOrderByDisplayOrderAscPublishedAtDesc(String categorySlug);
    @Query("SELECT a FROM Article a WHERE LOWER(a.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(a.shortDescription) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Article> searchByKeyword(String keyword, Pageable pageable);
    @Query("SELECT a FROM Article a WHERE a.categorySlug = :categorySlug")
    Page<Article> findByCategorySlug(String categorySlug, Pageable pageable);
}
