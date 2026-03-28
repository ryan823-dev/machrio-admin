package com.machrio.admin.service;

import com.machrio.admin.dto.ShippingRateDTO;
import com.machrio.admin.entity.ShippingMethod;
import com.machrio.admin.entity.ShippingRate;
import com.machrio.admin.repository.ShippingMethodRepository;
import com.machrio.admin.repository.ShippingRateRepository;
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
public class ShippingRateService {

    @Autowired
    private ShippingRateRepository shippingRateRepository;

    @Autowired
    private ShippingMethodRepository shippingMethodRepository;

    @Transactional(readOnly = true)
    public List<ShippingRateDTO> getAllShippingRates(int page, int pageSize, UUID methodId, String country) {
        Pageable pageable = PageRequest.of(page, pageSize);
        Page<ShippingRate> ratesPage;

        if (methodId != null && country != null) {
            ratesPage = shippingRateRepository.findByMethodIdAndCountry(methodId, country, pageable);
        } else if (methodId != null) {
            List<ShippingRate> rates = shippingRateRepository.findByShippingMethodIdAndActiveTrue(methodId);
            return rates.stream().map(this::toDTO).collect(Collectors.toList());
        } else if (country != null) {
            List<ShippingRate> rates = shippingRateRepository.findByCountryCodeAndActiveTrue(country);
            return rates.stream().map(this::toDTO).collect(Collectors.toList());
        } else {
            ratesPage = shippingRateRepository.findAll(pageable);
        }

        return ratesPage.getContent().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ShippingRateDTO getShippingRateById(UUID id) {
        ShippingRate rate = shippingRateRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Shipping rate not found with id: " + id));
        return toDTO(rate);
    }

    public ShippingRateDTO createShippingRate(ShippingRateDTO dto) {
        ShippingRate rate = new ShippingRate();
        
        ShippingMethod method = shippingMethodRepository.findById(dto.getShippingMethodId())
                .orElseThrow(() -> new EntityNotFoundException("Shipping method not found with id: " + dto.getShippingMethodId()));
        
        rate.setShippingMethod(method);
        rate.setCountryCode(dto.getCountryCode());
        rate.setBaseWeight(dto.getBaseWeight());
        rate.setBaseRate(dto.getBaseRate());
        rate.setAdditionalRate(dto.getAdditionalRate());
        rate.setHandlingFee(dto.getHandlingFee());
        rate.setActive(dto.getActive());

        ShippingRate saved = shippingRateRepository.save(rate);
        return toDTO(saved);
    }

    public ShippingRateDTO updateShippingRate(UUID id, ShippingRateDTO dto) {
        ShippingRate rate = shippingRateRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Shipping rate not found with id: " + id));

        if (dto.getShippingMethodId() != null) {
            ShippingMethod method = shippingMethodRepository.findById(dto.getShippingMethodId())
                    .orElseThrow(() -> new EntityNotFoundException("Shipping method not found with id: " + dto.getShippingMethodId()));
            rate.setShippingMethod(method);
        }
        
        rate.setCountryCode(dto.getCountryCode());
        rate.setBaseWeight(dto.getBaseWeight());
        rate.setBaseRate(dto.getBaseRate());
        rate.setAdditionalRate(dto.getAdditionalRate());
        rate.setHandlingFee(dto.getHandlingFee());
        rate.setActive(dto.getActive());

        ShippingRate updated = shippingRateRepository.save(rate);
        return toDTO(updated);
    }

    public void deleteShippingRate(UUID id) {
        if (!shippingRateRepository.existsById(id)) {
            throw new EntityNotFoundException("Shipping rate not found with id: " + id);
        }
        shippingRateRepository.deleteById(id);
    }

    private ShippingRateDTO toDTO(ShippingRate rate) {
        ShippingRateDTO dto = new ShippingRateDTO();
        dto.setId(rate.getId());
        dto.setShippingMethodId(rate.getShippingMethod().getId());
        dto.setShippingMethodName(rate.getShippingMethod().getName());
        dto.setCountryCode(rate.getCountryCode());
        dto.setBaseWeight(rate.getBaseWeight());
        dto.setBaseRate(rate.getBaseRate());
        dto.setAdditionalRate(rate.getAdditionalRate());
        dto.setHandlingFee(rate.getHandlingFee());
        dto.setActive(rate.getActive());
        dto.setCreatedAt(rate.getCreatedAt());
        dto.setUpdatedAt(rate.getUpdatedAt());
        return dto;
    }
}
