package com.machrio.admin.controller;

import com.machrio.admin.dto.ApiResponse;
import com.machrio.admin.dto.CreateCustomerRequest;
import com.machrio.admin.dto.CustomerDTO;
import com.machrio.admin.dto.PageResponse;
import com.machrio.admin.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<CustomerDTO>>> getAllCustomers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(required = false) String source,
            @RequestParam(required = false) String search) {
        PageResponse<CustomerDTO> result = customerService.getAllCustomers(page, pageSize, source, search);
        return ResponseEntity.ok(ApiResponse.success(result, result.getTotalItems()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerDTO>> getCustomerById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(customerService.getCustomerById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CustomerDTO>> createCustomer(@Valid @RequestBody CreateCustomerRequest request) {
        CustomerDTO customer = customerService.createCustomer(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(customer, "Customer created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerDTO>> updateCustomer(@PathVariable UUID id, @Valid @RequestBody CreateCustomerRequest request) {
        return ResponseEntity.ok(ApiResponse.success(customerService.updateCustomer(id, request), "Customer updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCustomer(@PathVariable UUID id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Customer deleted successfully"));
    }
}
