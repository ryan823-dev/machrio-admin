package com.machrio.admin.controller;

import com.machrio.admin.dto.FreeShippingRuleDTO;
import com.machrio.admin.service.FreeShippingRuleService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/free-shipping-rules")
@CrossOrigin(origins = "*", maxAge = 3600)
public class FreeShippingRuleController {

    @Autowired
    private FreeShippingRuleService freeShippingRuleService;

    @GetMapping
    public ResponseEntity<List<FreeShippingRuleDTO>> getAllFreeShippingRules(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(required = false) UUID methodId,
            @RequestParam(required = false) String country) {
        List<FreeShippingRuleDTO> rules = freeShippingRuleService.getAllFreeShippingRules(page, pageSize, methodId, country);
        return ResponseEntity.ok(rules);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FreeShippingRuleDTO> getFreeShippingRuleById(@PathVariable UUID id) {
        FreeShippingRuleDTO rule = freeShippingRuleService.getFreeShippingRuleById(id);
        return ResponseEntity.ok(rule);
    }

    @PostMapping
    public ResponseEntity<FreeShippingRuleDTO> createFreeShippingRule(@Valid @RequestBody FreeShippingRuleDTO dto) {
        FreeShippingRuleDTO rule = freeShippingRuleService.createFreeShippingRule(dto);
        return ResponseEntity.ok(rule);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FreeShippingRuleDTO> updateFreeShippingRule(
            @PathVariable UUID id,
            @Valid @RequestBody FreeShippingRuleDTO dto) {
        FreeShippingRuleDTO rule = freeShippingRuleService.updateFreeShippingRule(id, dto);
        return ResponseEntity.ok(rule);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFreeShippingRule(@PathVariable UUID id) {
        freeShippingRuleService.deleteFreeShippingRule(id);
        return ResponseEntity.noContent().build();
    }
}
