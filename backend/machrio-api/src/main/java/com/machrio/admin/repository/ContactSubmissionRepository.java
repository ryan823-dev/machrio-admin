package com.machrio.admin.repository;

import com.machrio.admin.entity.ContactSubmission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ContactSubmissionRepository extends JpaRepository<ContactSubmission, UUID> {
    Page<ContactSubmission> findByStatus(String status, Pageable pageable);
    Page<ContactSubmission> findBySubject(String subject, Pageable pageable);
    @Query("SELECT c FROM ContactSubmission c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(c.email) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<ContactSubmission> searchByKeyword(String keyword, Pageable pageable);
    long countByStatus(String status);
}
