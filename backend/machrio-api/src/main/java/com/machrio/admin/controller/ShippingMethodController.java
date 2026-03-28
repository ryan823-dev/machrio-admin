package com.machrio.admin.controller;

import com.machrio.admin.dto.ShippingMethodDTO;
import com.machrio.admin.service.ShippingMethodService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/shipping-methods")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ShippingMethodController {

    @Autowired
    private ShippingMethodService shippingMethodService;

    @GetMapping
    public ResponseEntity<List<ShippingMethodDTO>> getAllShippingMethods(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(required = false) String search) {
        List<ShippingMethodDTO> methods = shippingMethodService.getAllShippingMethods(page, pageSize, search);
        return ResponseEntity.ok(methods);
    }

    @GetMapping("/active")
    public ResponseEntity<List<ShippingMethodDTO>> getActiveShippingMethods() {
        List<ShippingMethodDTO> methods = shippingMethodService.getActiveShippingMethods();
        return ResponseEntity.ok(methods);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShippingMethodDTO> getShippingMethodById(@PathVariable UUID id) {
        ShippingMethodDTO method = shippingMethodService.getShippingMethodById(id);
        return ResponseEntity.ok(method);
    }

    @PostMapping
    public ResponseEntity<ShippingMethodDTO> createShippingMethod(@Valid @RequestBody ShippingMethodDTO dto) {
        ShippingMethodDTO method = shippingMethodService.createShippingMethod(dto);
        return ResponseEntity.ok(method);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ShippingMethodDTO> updateShippingMethod(
            @PathVariable UUID id,
            @Valid @RequestBody ShippingMethodDTO dto) {
        ShippingMethodDTO method = shippingMethodService.updateShippingMethod(id, dto);
        return ResponseEntity.ok(method);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteShippingMethod(@PathVariable UUID id) {
        shippingMethodService.deleteShippingMethod(id);
        return ResponseEntity.noContent().build();
    }
}
