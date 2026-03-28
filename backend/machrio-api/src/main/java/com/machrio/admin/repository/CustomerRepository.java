package com.machrio.admin.repository;

import com.machrio.admin.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, UUID> {
    Optional<Customer> findByEmail(String email);
    boolean existsByEmail(String email);
    @Query("SELECT c FROM Customer c WHERE LOWER(c.company) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(c.email) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Customer> searchByKeyword(String keyword, Pageable pageable);
    Page<Customer> findBySource(String source, Pageable pageable);
}
