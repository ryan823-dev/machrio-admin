package com.machrio.admin.controller;

import com.machrio.admin.dto.ApiResponse;
import com.machrio.admin.dto.CreateOrderRequest;
import com.machrio.admin.dto.OrderDTO;
import com.machrio.admin.dto.PageResponse;
import com.machrio.admin.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<OrderDTO>>> getAllOrders(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        PageResponse<OrderDTO> result = orderService.getAllOrders(page, pageSize, status, search);
        return ResponseEntity.ok(ApiResponse.success(result, result.getTotalItems()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderDTO>> getOrderById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrderById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OrderDTO>> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        OrderDTO order = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(order, "Order created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderDTO>> updateOrder(@PathVariable UUID id, @Valid @RequestBody CreateOrderRequest request) {
        return ResponseEntity.ok(ApiResponse.success(orderService.updateOrder(id, request), "Order updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteOrder(@PathVariable UUID id) {
        orderService.deleteOrder(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Order deleted successfully"));
    }
}
