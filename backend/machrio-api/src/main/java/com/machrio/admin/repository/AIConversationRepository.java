package com.machrio.admin.repository;

import com.machrio.admin.entity.AIConversation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AIConversationRepository extends JpaRepository<AIConversation, UUID> {

    java.util.Optional<AIConversation> findBySessionId(String sessionId);

    Page<AIConversation> findByStatus(String status, Pageable pageable);

    Page<AIConversation> findByPriority(String priority, Pageable pageable);

    Page<AIConversation> findByStatusAndPriority(String status, String priority, Pageable pageable);

    @Query("""
        SELECT c FROM AIConversation c
        WHERE LOWER(COALESCE(c.userName, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
           OR LOWER(COALESCE(c.userEmail, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
           OR LOWER(COALESCE(c.userCompany, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
           OR LOWER(COALESCE(c.sourcePage, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
           OR LOWER(COALESCE(c.sessionId, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
        """)
    Page<AIConversation> searchByKeyword(String keyword, Pageable pageable);

    @Query("""
        SELECT c FROM AIConversation c
        WHERE (:status IS NULL OR c.status = :status)
          AND (:priority IS NULL OR c.priority = :priority)
          AND (
                :keyword IS NULL
                OR LOWER(COALESCE(c.userName, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(COALESCE(c.userEmail, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(COALESCE(c.userCompany, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(COALESCE(c.sourcePage, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(COALESCE(c.sessionId, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
              )
        """)
    Page<AIConversation> search(String status, String priority, String keyword, Pageable pageable);
}
