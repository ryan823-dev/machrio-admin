package com.machrio.admin.repository;

import com.machrio.admin.entity.ShippingRate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ShippingRateRepository extends JpaRepository<ShippingRate, UUID> {
    List<ShippingRate> findByShippingMethodIdAndActiveTrue(UUID shippingMethodId);
    List<ShippingRate> findByCountryCodeAndActiveTrue(String countryCode);
    
    @Query("SELECT sr FROM ShippingRate sr WHERE sr.shippingMethod.id = :methodId AND LOWER(sr.countryCode) LIKE LOWER(CONCAT('%', :country, '%'))")
    Page<ShippingRate> findByMethodIdAndCountry(UUID methodId, String country, Pageable pageable);
}
