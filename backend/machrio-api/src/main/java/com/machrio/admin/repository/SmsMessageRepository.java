package com.machrio.admin.repository;

import com.machrio.admin.entity.SmsMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SmsMessageRepository extends JpaRepository<SmsMessage, UUID> {
    Page<SmsMessage> findByPhoneNumber(String phoneNumber, Pageable pageable);
    Page<SmsMessage> findByStatus(String status, Pageable pageable);
    Page<SmsMessage> findByPhoneNumberAndStatus(String phoneNumber, String status, Pageable pageable);

    @Query("SELECT s FROM SmsMessage s WHERE LOWER(s.message) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(s.senderNumber) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<SmsMessage> searchByKeyword(String keyword, Pageable pageable);

    long countByStatus(String status);
    long countByPhoneNumber(String phoneNumber);
    boolean existsByExternalId(String externalId);
}