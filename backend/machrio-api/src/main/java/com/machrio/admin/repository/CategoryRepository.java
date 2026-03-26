package com.machrio.admin.repository;

import com.machrio.admin.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {

    Optional<Category> findBySlug(String slug);

    boolean existsBySlug(String slug);

    List<Category> findByParentIdIsNullOrderByDisplayOrderAsc();

    List<Category> findByParentIdOrderByDisplayOrderAsc(UUID parentId);

    List<Category> findByFeaturedTrueOrderByDisplayOrderAsc();

    Page<Category> findByStatus(String status, Pageable pageable);

    @Query("SELECT c FROM Category c WHERE c.parentId IS NULL ORDER BY c.displayOrder ASC NULLS LAST")
    List<Category> findTopLevelCategories();

    @Query("SELECT COUNT(c) FROM Category c WHERE c.parentId IS NULL")
    long countTopLevelCategories();
}
