package com.machrio.admin.service;

import com.machrio.admin.dto.FreeShippingRuleDTO;
import com.machrio.admin.entity.FreeShippingRule;
import com.machrio.admin.entity.ShippingMethod;
import com.machrio.admin.repository.FreeShippingRuleRepository;
import com.machrio.admin.repository.ShippingMethodRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class FreeShippingRuleService {

    @Autowired
    private FreeShippingRuleRepository freeShippingRuleRepository;

    @Autowired
    private ShippingMethodRepository shippingMethodRepository;

    @Transactional(readOnly = true)
    public List<FreeShippingRuleDTO> getAllFreeShippingRules(int page, int pageSize, UUID methodId, String country) {
        Pageable pageable = PageRequest.of(page, pageSize);
        Page<FreeShippingRule> rulesPage;

        if (methodId != null && country != null) {
            rulesPage = freeShippingRuleRepository.findByMethodIdAndCountry(methodId, country, pageable);
        } else if (methodId != null) {
            List<FreeShippingRule> rules = freeShippingRuleRepository.findByShippingMethodIdAndActiveTrue(methodId);
            return rules.stream().map(this::toDTO).collect(Collectors.toList());
        } else if (country != null) {
            List<FreeShippingRule> rules = freeShippingRuleRepository.findByCountryCodeAndActiveTrue(country);
            return rules.stream().map(this::toDTO).collect(Collectors.toList());
        } else {
            rulesPage = freeShippingRuleRepository.findAll(pageable);
        }

        return rulesPage.getContent().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FreeShippingRuleDTO getFreeShippingRuleById(UUID id) {
        FreeShippingRule rule = freeShippingRuleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Free shipping rule not found with id: " + id));
        return toDTO(rule);
    }

    public FreeShippingRuleDTO createFreeShippingRule(FreeShippingRuleDTO dto) {
        FreeShippingRule rule = new FreeShippingRule();
        
        ShippingMethod method = shippingMethodRepository.findById(dto.getShippingMethodId())
                .orElseThrow(() -> new EntityNotFoundException("Shipping method not found with id: " + dto.getShippingMethodId()));
        
        rule.setShippingMethod(method);
        rule.setCountryCode(dto.getCountryCode());
        rule.setMinimumAmount(dto.getMinimumAmount());
        rule.setActive(dto.getActive());

        FreeShippingRule saved = freeShippingRuleRepository.save(rule);
        return toDTO(saved);
    }

    public FreeShippingRuleDTO updateFreeShippingRule(UUID id, FreeShippingRuleDTO dto) {
        FreeShippingRule rule = freeShippingRuleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Free shipping rule not found with id: " + id));

        if (dto.getShippingMethodId() != null) {
            ShippingMethod method = shippingMethodRepository.findById(dto.getShippingMethodId())
                    .orElseThrow(() -> new EntityNotFoundException("Shipping method not found with id: " + dto.getShippingMethodId()));
            rule.setShippingMethod(method);
        }
        
        rule.setCountryCode(dto.getCountryCode());
        rule.setMinimumAmount(dto.getMinimumAmount());
        rule.setActive(dto.getActive());

        FreeShippingRule updated = freeShippingRuleRepository.save(rule);
        return toDTO(updated);
    }

    public void deleteFreeShippingRule(UUID id) {
        if (!freeShippingRuleRepository.existsById(id)) {
            throw new EntityNotFoundException("Free shipping rule not found with id: " + id);
        }
        freeShippingRuleRepository.deleteById(id);
    }

    private FreeShippingRuleDTO toDTO(FreeShippingRule rule) {
        FreeShippingRuleDTO dto = new FreeShippingRuleDTO();
        dto.setId(rule.getId());
        dto.setShippingMethodId(rule.getShippingMethod().getId());
        dto.setShippingMethodName(rule.getShippingMethod().getName());
        dto.setCountryCode(rule.getCountryCode());
        dto.setMinimumAmount(rule.getMinimumAmount());
        dto.setActive(rule.getActive());
        dto.setCreatedAt(rule.getCreatedAt());
        dto.setUpdatedAt(rule.getUpdatedAt());
        return dto;
    }
}
