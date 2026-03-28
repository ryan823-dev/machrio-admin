package com.machrio.admin.repository;

import com.machrio.admin.entity.FreeShippingRule;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FreeShippingRuleRepository extends JpaRepository<FreeShippingRule, UUID> {
    List<FreeShippingRule> findByShippingMethodIdAndActiveTrue(UUID shippingMethodId);
    List<FreeShippingRule> findByCountryCodeAndActiveTrue(String countryCode);
    
    @Query("SELECT fsr FROM FreeShippingRule fsr WHERE fsr.shippingMethod.id = :methodId AND LOWER(fsr.countryCode) LIKE LOWER(CONCAT('%', :country, '%'))")
    Page<FreeShippingRule> findByMethodIdAndCountry(UUID methodId, String country, Pageable pageable);
}
