package com.machrio.admin.service;

import com.machrio.admin.dto.ShippingMethodDTO;
import com.machrio.admin.entity.ShippingMethod;
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
public class ShippingMethodService {

    @Autowired
    private ShippingMethodRepository shippingMethodRepository;

    @Transactional(readOnly = true)
    public List<ShippingMethodDTO> getAllShippingMethods(int page, int pageSize, String search) {
        Pageable pageable = PageRequest.of(page, pageSize);
        Page<ShippingMethod> shippingMethodsPage;

        if (search != null && !search.isEmpty()) {
            shippingMethodsPage = shippingMethodRepository.searchByKeyword(search, pageable);
        } else {
            shippingMethodsPage = shippingMethodRepository.findAll(pageable);
        }

        return shippingMethodsPage.getContent().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ShippingMethodDTO> getActiveShippingMethods() {
        return shippingMethodRepository.findByActiveTrueOrderBySortOrderAsc().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ShippingMethodDTO getShippingMethodById(UUID id) {
        ShippingMethod method = shippingMethodRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Shipping method not found with id: " + id));
        return toDTO(method);
    }

    public ShippingMethodDTO createShippingMethod(ShippingMethodDTO dto) {
        ShippingMethod method = new ShippingMethod();
        method.setName(dto.getName());
        method.setCode(dto.getCode());
        method.setDescription(dto.getDescription());
        method.setIcon(dto.getIcon());
        method.setTransitDays(dto.getTransitDays());
        method.setSortOrder(dto.getSortOrder());
        method.setActive(dto.getActive());

        ShippingMethod saved = shippingMethodRepository.save(method);
        return toDTO(saved);
    }

    public ShippingMethodDTO updateShippingMethod(UUID id, ShippingMethodDTO dto) {
        ShippingMethod method = shippingMethodRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Shipping method not found with id: " + id));

        method.setName(dto.getName());
        method.setCode(dto.getCode());
        method.setDescription(dto.getDescription());
        method.setIcon(dto.getIcon());
        method.setTransitDays(dto.getTransitDays());
        method.setSortOrder(dto.getSortOrder());
        method.setActive(dto.getActive());

        ShippingMethod updated = shippingMethodRepository.save(method);
        return toDTO(updated);
    }

    public void deleteShippingMethod(UUID id) {
        if (!shippingMethodRepository.existsById(id)) {
            throw new EntityNotFoundException("Shipping method not found with id: " + id);
        }
        shippingMethodRepository.deleteById(id);
    }

    private ShippingMethodDTO toDTO(ShippingMethod method) {
        ShippingMethodDTO dto = new ShippingMethodDTO();
        dto.setId(method.getId());
        dto.setName(method.getName());
        dto.setCode(method.getCode());
        dto.setDescription(method.getDescription());
        dto.setIcon(method.getIcon());
        dto.setTransitDays(method.getTransitDays());
        dto.setSortOrder(method.getSortOrder());
        dto.setActive(method.getActive());
        dto.setCreatedAt(method.getCreatedAt());
        dto.setUpdatedAt(method.getUpdatedAt());
        return dto;
    }
}
