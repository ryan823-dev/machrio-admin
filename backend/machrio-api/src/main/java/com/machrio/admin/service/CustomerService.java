package com.machrio.admin.service;

import com.machrio.admin.dto.CreateCustomerRequest;
import com.machrio.admin.dto.CustomerDTO;
import com.machrio.admin.dto.PageResponse;
import com.machrio.admin.entity.Customer;
import com.machrio.admin.repository.CustomerRepository;
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
public class CustomerService {

    private final CustomerRepository customerRepository;
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'").withZone(ZoneId.of("UTC"));

    public PageResponse<CustomerDTO> getAllCustomers(int page, int pageSize, String source, String search) {
        PageRequest pageRequest = PageRequest.of(page - 1, pageSize, Sort.by("createdAt").descending());

        Page<Customer> customerPage;
        if (search != null && !search.isBlank()) {
            customerPage = customerRepository.searchByKeyword(search, pageRequest);
        } else if (source != null && !source.isBlank()) {
            customerPage = customerRepository.findBySource(source, pageRequest);
        } else {
            customerPage = customerRepository.findAll(pageRequest);
        }

        List<CustomerDTO> dtos = customerPage.getContent().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return PageResponse.from(customerPage, dtos);
    }

    public CustomerDTO getCustomerById(UUID id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found: " + id));
        return toDTO(customer);
    }

    public CustomerDTO getCustomerByEmail(String email) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Customer not found with email: " + email));
        return toDTO(customer);
    }

    @Transactional
    public CustomerDTO createCustomer(CreateCustomerRequest request) {
        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Customer with email already exists: " + request.getEmail());
        }

        Customer customer = new Customer();
        updateCustomerFromRequest(customer, request);
        customer = customerRepository.save(customer);
        return toDTO(customer);
    }

    @Transactional
    public CustomerDTO updateCustomer(UUID id, CreateCustomerRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found: " + id));

        // Check email uniqueness if changed
        if (!customer.getEmail().equalsIgnoreCase(request.getEmail()) && customerRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Customer with email already exists: " + request.getEmail());
        }

        updateCustomerFromRequest(customer, request);
        customer = customerRepository.save(customer);
        return toDTO(customer);
    }

    @Transactional
    public void deleteCustomer(UUID id) {
        if (!customerRepository.existsById(id)) {
            throw new RuntimeException("Customer not found: " + id);
        }
        customerRepository.deleteById(id);
    }

    private void updateCustomerFromRequest(Customer customer, CreateCustomerRequest request) {
        customer.setCompany(request.getCompany());
        customer.setName(request.getName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setTitle(request.getTitle());
        customer.setSource(request.getSource());
        customer.setShippingAddresses(request.getShippingAddresses());
        customer.setBillingInfo(request.getBillingInfo());
        customer.setTags(request.getTags());
        customer.setNotes(request.getNotes());
    }

    private CustomerDTO toDTO(Customer customer) {
        CustomerDTO dto = new CustomerDTO();
        dto.setId(customer.getId());
        dto.setCompany(customer.getCompany());
        dto.setName(customer.getName());
        dto.setEmail(customer.getEmail());
        dto.setPhone(customer.getPhone());
        dto.setTitle(customer.getTitle());
        dto.setSource(customer.getSource());
        dto.setShippingAddresses(customer.getShippingAddresses());
        dto.setBillingInfo(customer.getBillingInfo());
        dto.setTags(customer.getTags());
        dto.setNotes(customer.getNotes());
        dto.setCreatedAt(customer.getCreatedAt() != null ? FORMATTER.format(customer.getCreatedAt()) : null);
        dto.setUpdatedAt(customer.getUpdatedAt() != null ? FORMATTER.format(customer.getUpdatedAt()) : null);
        return dto;
    }
}
