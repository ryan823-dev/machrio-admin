package com.machrio.admin.repository;

import com.machrio.admin.entity.Redirect;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RedirectRepository extends JpaRepository<Redirect, UUID> {
    Optional<Redirect> findBySourceUrl(String sourceUrl);
    boolean existsBySourceUrl(String sourceUrl);
    List<Redirect> findByActiveTrueOrderCreatedAtDesc();
    @Query("SELECT r FROM Redirect r WHERE LOWER(r.sourceUrl) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(r.destinationUrl) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Redirect> searchByKeyword(String keyword, Pageable pageable);
}
