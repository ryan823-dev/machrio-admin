package com.machrio.admin.service;

import com.machrio.admin.dto.CreateProductRequest;
import com.machrio.admin.dto.PageResponse;
import com.machrio.admin.dto.ProductDTO;
import com.machrio.admin.entity.Product;
import com.machrio.admin.repository.ProductRepository;
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
public class ProductService {

    private final ProductRepository productRepository;
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'").withZone(ZoneId.of("UTC"));

    public PageResponse<ProductDTO> getAllProducts(int page, int pageSize, String status, String search) {
        PageRequest pageRequest = PageRequest.of(page - 1, pageSize, Sort.by("createdAt").descending());

        Page<Product> productPage;
        if (search != null && !search.isBlank()) {
            productPage = productRepository.searchByKeyword(search, pageRequest);
        } else if (status != null && !status.isBlank()) {
            productPage = productRepository.findByStatus(status, pageRequest);
        } else {
            productPage = productRepository.findAll(pageRequest);
        }

        List<ProductDTO> dtos = productPage.getContent().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return PageResponse.from(productPage, dtos);
    }

    public ProductDTO getProductById(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));
        return toDTO(product);
    }

    public ProductDTO getProductBySku(String sku) {
        Product product = productRepository.findBySku(sku)
                .orElseThrow(() -> new RuntimeException("Product not found with SKU: " + sku));
        return toDTO(product);
    }

    @Transactional
    public ProductDTO createProduct(CreateProductRequest request) {
        if (productRepository.existsBySku(request.getSku())) {
            throw new RuntimeException("Product with SKU already exists: " + request.getSku());
        }

        Product product = new Product();
        updateProductFromRequest(product, request);
        product = productRepository.save(product);
        return toDTO(product);
    }

    @Transactional
    public ProductDTO updateProduct(UUID id, CreateProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));

        // Check SKU uniqueness if changed
        if (!product.getSku().equals(request.getSku()) && productRepository.existsBySku(request.getSku())) {
            throw new RuntimeException("Product with SKU already exists: " + request.getSku());
        }

        updateProductFromRequest(product, request);
        product = productRepository.save(product);
        return toDTO(product);
    }

    @Transactional
    public void deleteProduct(UUID id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Product not found: " + id);
        }
        productRepository.deleteById(id);
    }

    private void updateProductFromRequest(Product product, CreateProductRequest request) {
        product.setName(request.getName());
        product.setSlug(request.getSlug());
        product.setSku(request.getSku());
        product.setShortDescription(request.getShortDescription());
        product.setFullDescription(request.getFullDescription());
        product.setPrimaryCategoryId(request.getPrimaryCategoryId());
        product.setStatus(request.getStatus());
        product.setAvailability(request.getAvailability());
        product.setPurchaseMode(request.getPurchaseMode());
        product.setLeadTime(request.getLeadTime());
        product.setMinOrderQuantity(request.getMinOrderQuantity());
        product.setPackageQty(request.getPackageQty());
        product.setPackageUnit(request.getPackageUnit());
        product.setWeight(request.getWeight());
        product.setPricing(request.getPricing());
        product.setSpecifications(request.getSpecifications());
        product.setFaq(request.getFaq());
        product.setImages(request.getImages());
        product.setExternalImageUrl(request.getExternalImageUrl());
        product.setAdditionalImageUrls(request.getAdditionalImageUrls());
        product.setCategories(request.getCategories());
        product.setTags(request.getTags());
        product.setMetaTitle(request.getMetaTitle());
        product.setMetaDescription(request.getMetaDescription());
        product.setFocusKeyword(request.getFocusKeyword());
        product.setSourceUrl(request.getSourceUrl());
        product.setShippingInfo(request.getShippingInfo());
        product.setMeta(request.getMeta());
        product.setPrimaryImageId(request.getPrimaryImageId());
    }

    private ProductDTO toDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setSlug(product.getSlug());
        dto.setSku(product.getSku());
        dto.setShortDescription(product.getShortDescription());
        dto.setFullDescription(product.getFullDescription());
        dto.setPrimaryCategoryId(product.getPrimaryCategoryId());
        dto.setStatus(product.getStatus());
        dto.setAvailability(product.getAvailability());
        dto.setPurchaseMode(product.getPurchaseMode());
        dto.setLeadTime(product.getLeadTime());
        dto.setMinOrderQuantity(product.getMinOrderQuantity());
        dto.setPackageQty(product.getPackageQty());
        dto.setPackageUnit(product.getPackageUnit());
        dto.setWeight(product.getWeight());
        dto.setPricing(product.getPricing());
        dto.setSpecifications(product.getSpecifications());
        dto.setFaq(product.getFaq());
        dto.setImages(product.getImages() != null ? product.getImages() : null);
        dto.setExternalImageUrl(product.getExternalImageUrl());
        dto.setAdditionalImageUrls(product.getAdditionalImageUrls() != null ? product.getAdditionalImageUrls() : null);
        dto.setCategories(product.getCategories());
        dto.setTags(product.getTags());
        dto.setMetaTitle(product.getMetaTitle());
        dto.setMetaDescription(product.getMetaDescription());
        dto.setFocusKeyword(product.getFocusKeyword());
        dto.setSourceUrl(product.getSourceUrl());
        dto.setShippingInfo(product.getShippingInfo());
        dto.setMeta(product.getMeta());
        dto.setPrimaryImageId(product.getPrimaryImageId());
        dto.setCreatedAt(product.getCreatedAt() != null ? FORMATTER.format(product.getCreatedAt()) : null);
        dto.setUpdatedAt(product.getUpdatedAt() != null ? FORMATTER.format(product.getUpdatedAt()) : null);
        return dto;
    }
}
