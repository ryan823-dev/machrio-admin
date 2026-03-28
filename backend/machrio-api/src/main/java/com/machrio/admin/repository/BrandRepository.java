package com.machrio.admin.repository;

import com.machrio.admin.entity.Brand;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BrandRepository extends JpaRepository<Brand, UUID> {
    Optional<Brand> findBySlug(String slug);
    boolean existsBySlug(String slug);
    List<Brand> findByFeaturedTrueOrderByNameAsc();
    @Query("SELECT b FROM Brand b WHERE LOWER(b.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Brand> searchByKeyword(String keyword, Pageable pageable);
}
