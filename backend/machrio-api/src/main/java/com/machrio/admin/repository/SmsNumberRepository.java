package com.machrio.admin.repository;

import com.machrio.admin.entity.SmsNumber;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SmsNumberRepository extends JpaRepository<SmsNumber, UUID> {
    Optional<SmsNumber> findByPhoneNumber(String phoneNumber);
    boolean existsByPhoneNumber(String phoneNumber);
}