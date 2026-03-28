package com.machrio.admin.repository;

import com.machrio.admin.entity.GlossaryTerm;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GlossaryTermRepository extends JpaRepository<GlossaryTerm, UUID> {
    Optional<GlossaryTerm> findBySlug(String slug);
    boolean existsBySlug(String slug);
    List<GlossaryTerm> findByCategorySlugOrderByDisplayOrderAscTermAsc(String categorySlug);
    @Query("SELECT g FROM GlossaryTerm g WHERE LOWER(g.term) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(g.shortDefinition) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<GlossaryTerm> searchByKeyword(String keyword, Pageable pageable);
    @Query("SELECT g FROM GlossaryTerm g WHERE g.categorySlug = :categorySlug")
    Page<GlossaryTerm> findByCategorySlug(String categorySlug, Pageable pageable);
}
