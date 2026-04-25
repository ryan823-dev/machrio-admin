package com.machrio.admin.repository;

import com.machrio.admin.entity.CustomerRequirement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CustomerRequirementRepository extends JpaRepository<CustomerRequirement, UUID> {

    List<CustomerRequirement> findByConversationIdOrderByCreatedAtDesc(UUID conversationId);

    long countByConversationId(UUID conversationId);

    void deleteByConversationId(UUID conversationId);

    Page<CustomerRequirement> findByStatus(String status, Pageable pageable);

    Page<CustomerRequirement> findByPriority(String priority, Pageable pageable);

    Page<CustomerRequirement> findByStatusAndPriority(String status, String priority, Pageable pageable);

    @Query("""
        SELECT r FROM CustomerRequirement r
        WHERE (:status IS NULL OR r.status = :status)
          AND (:priority IS NULL OR r.priority = :priority)
          AND (
                :keyword IS NULL
                OR LOWER(COALESCE(r.customerName, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(COALESCE(r.customerEmail, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(COALESCE(r.companyName, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(COALESCE(r.productCategory, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
              )
        """)
    Page<CustomerRequirement> search(String status, String priority, String keyword, Pageable pageable);

    @Modifying
    @Query("UPDATE CustomerRequirement r SET r.conversationId = :targetConversationId WHERE r.conversationId = :sourceConversationId")
    void moveConversationRequirements(UUID sourceConversationId, UUID targetConversationId);
}
