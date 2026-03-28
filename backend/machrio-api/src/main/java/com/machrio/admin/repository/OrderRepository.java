package com.machrio.admin.repository;

import com.machrio.admin.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    Optional<Order> findByOrderNumber(String orderNumber);
    Page<Order> findByStatus(String status, Pageable pageable);
    Page<Order> findByPaymentStatus(String paymentStatus, Pageable pageable);
    @Query("SELECT o FROM Order o WHERE LOWER(o.orderNumber) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Order> searchByKeyword(String keyword, Pageable pageable);
    long countByStatus(String status);
    long countByPaymentStatus(String paymentStatus);
}
