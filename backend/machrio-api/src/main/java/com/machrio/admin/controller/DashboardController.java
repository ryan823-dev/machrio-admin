package com.machrio.admin.controller;

import com.machrio.admin.dto.ApiResponse;
import com.machrio.admin.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DashboardController {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final RfqSubmissionRepository rfqRepository;
    private final ContactSubmissionRepository contactRepository;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalProducts", productRepository.count());
        stats.put("totalCategories", categoryRepository.count());
        stats.put("totalOrders", orderRepository.count());
        stats.put("totalCustomers", customerRepository.count());
        stats.put("pendingOrders", orderRepository.countByStatus("pending"));
        stats.put("newRfqs", rfqRepository.countByStatus("new"));
        stats.put("newContacts", contactRepository.countByStatus("new"));
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
