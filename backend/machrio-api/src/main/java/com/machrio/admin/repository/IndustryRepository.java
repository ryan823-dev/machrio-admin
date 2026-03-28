package com.machrio.admin.repository;

import com.machrio.admin.entity.Industry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IndustryRepository extends JpaRepository<Industry, UUID> {
    Optional<Industry> findBySlug(String slug);
    boolean existsBySlug(String slug);
    List<Industry> findByFeaturedTrueOrderByNameAsc();
    @Query("SELECT i FROM Industry i WHERE LOWER(i.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(i.shortDescription) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Industry> searchByKeyword(String keyword, Pageable pageable);
}
