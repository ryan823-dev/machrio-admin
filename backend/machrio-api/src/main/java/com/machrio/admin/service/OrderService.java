package com.machrio.admin.service;

import com.machrio.admin.dto.CreateOrderRequest;
import com.machrio.admin.dto.OrderDTO;
import com.machrio.admin.dto.PageResponse;
import com.machrio.admin.entity.Order;
import com.machrio.admin.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'").withZone(ZoneId.of("UTC"));

    public PageResponse<OrderDTO> getAllOrders(int page, int pageSize, String status, String search) {
        PageRequest pageRequest = PageRequest.of(page - 1, pageSize, Sort.by("createdAt").descending());
        Page<Order> orderPage;
        if (search != null && !search.isBlank()) {
            orderPage = orderRepository.searchByKeyword(search, pageRequest);
        } else if (status != null && !status.isBlank()) {
            orderPage = orderRepository.findByStatus(status, pageRequest);
        } else {
            orderPage = orderRepository.findAll(pageRequest);
        }
        List<OrderDTO> dtos = orderPage.getContent().stream().map(this::toDTO).collect(Collectors.toList());
        return PageResponse.from(orderPage, dtos);
    }

    public OrderDTO getOrderById(UUID id) {
        Order order = orderRepository.findById(id).orElseThrow(() -> new RuntimeException("Order not found: " + id));
        return toDTO(order);
    }

    @Transactional
    public OrderDTO createOrder(CreateOrderRequest request) {
        Order order = new Order();
        updateFromRequest(order, request);
        order = orderRepository.save(order);
        return toDTO(order);
    }

    @Transactional
    public OrderDTO updateOrder(UUID id, CreateOrderRequest request) {
        Order order = orderRepository.findById(id).orElseThrow(() -> new RuntimeException("Order not found: " + id));
        updateFromRequest(order, request);
        order = orderRepository.save(order);
        return toDTO(order);
    }

    @Transactional
    public void deleteOrder(UUID id) {
        if (!orderRepository.existsById(id)) throw new RuntimeException("Order not found: " + id);
        orderRepository.deleteById(id);
    }

    public long countByStatus(String status) { return orderRepository.countByStatus(status); }

    private void updateFromRequest(Order o, CreateOrderRequest r) {
        if (r.getOrderNumber() != null) o.setOrderNumber(r.getOrderNumber());
        o.setStatus(r.getStatus());
        o.setPaymentStatus(r.getPaymentStatus());
        o.setSource(r.getSource());
        o.setCustomerRefId(r.getCustomerRefId());
        o.setCustomer(r.getCustomer());
        o.setItems(r.getItems());
        o.setShipping(r.getShipping());
        o.setSubtotal(r.getSubtotal());
        o.setShippingCost(r.getShippingCost());
        o.setTax(r.getTax());
        o.setTotal(r.getTotal());
        o.setCurrency(r.getCurrency());
        o.setPayment(r.getPayment());
        o.setCustomerNotes(r.getCustomerNotes());
        o.setInternalNotes(r.getInternalNotes());
    }

    private OrderDTO toDTO(Order o) {
        OrderDTO dto = new OrderDTO();
        dto.setId(o.getId());
        dto.setOrderNumber(o.getOrderNumber());
        dto.setStatus(o.getStatus());
        dto.setPaymentStatus(o.getPaymentStatus());
        dto.setSource(o.getSource());
        dto.setCustomerRefId(o.getCustomerRefId());
        dto.setCustomer(o.getCustomer());
        dto.setItems(o.getItems());
        dto.setShipping(o.getShipping());
        dto.setSubtotal(o.getSubtotal());
        dto.setShippingCost(o.getShippingCost());
        dto.setTax(o.getTax());
        dto.setTotal(o.getTotal());
        dto.setCurrency(o.getCurrency());
        dto.setPayment(o.getPayment());
        dto.setCustomerNotes(o.getCustomerNotes());
        dto.setInternalNotes(o.getInternalNotes());
        dto.setCreatedAt(o.getCreatedAt() != null ? FORMATTER.format(o.getCreatedAt()) : null);
        dto.setUpdatedAt(o.getUpdatedAt() != null ? FORMATTER.format(o.getUpdatedAt()) : null);
        return dto;
    }
}
