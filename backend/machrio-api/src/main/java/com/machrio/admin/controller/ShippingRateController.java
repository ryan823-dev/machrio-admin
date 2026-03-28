package com.machrio.admin.controller;

import com.machrio.admin.dto.ShippingRateDTO;
import com.machrio.admin.service.ShippingRateService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/shipping-rates")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ShippingRateController {

    @Autowired
    private ShippingRateService shippingRateService;

    @GetMapping
    public ResponseEntity<List<ShippingRateDTO>> getAllShippingRates(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(required = false) UUID methodId,
            @RequestParam(required = false) String country) {
        List<ShippingRateDTO> rates = shippingRateService.getAllShippingRates(page, pageSize, methodId, country);
        return ResponseEntity.ok(rates);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShippingRateDTO> getShippingRateById(@PathVariable UUID id) {
        ShippingRateDTO rate = shippingRateService.getShippingRateById(id);
        return ResponseEntity.ok(rate);
    }

    @PostMapping
    public ResponseEntity<ShippingRateDTO> createShippingRate(@Valid @RequestBody ShippingRateDTO dto) {
        ShippingRateDTO rate = shippingRateService.createShippingRate(dto);
        return ResponseEntity.ok(rate);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ShippingRateDTO> updateShippingRate(
            @PathVariable UUID id,
            @Valid @RequestBody ShippingRateDTO dto) {
        ShippingRateDTO rate = shippingRateService.updateShippingRate(id, dto);
        return ResponseEntity.ok(rate);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteShippingRate(@PathVariable UUID id) {
        shippingRateService.deleteShippingRate(id);
        return ResponseEntity.noContent().build();
    }
}
