package com.joelmart.backend.service;

import com.joelmart.backend.entity.Product;
import com.joelmart.backend.entity.User;
import com.joelmart.backend.repository.ProductRepository;
import com.joelmart.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ProductService(ProductRepository productRepository,
                          UserRepository userRepository) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    public Product addProduct(Product product, Long sellerId) {

        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));

        if (seller.getRole() != User.Role.SELLER) {
            throw new RuntimeException("Only sellers can add products");
        }

        product.setSeller(seller);
        product.setCreatedAt(LocalDateTime.now());

        return productRepository.save(product);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public List<Product> searchProducts(String name) {
        return productRepository.findByNameContainingIgnoreCase(name);
    }

    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategory(category);
    }

    public Product updateProduct(Long productId,
                                  Product updatedProduct,
                                  Long sellerId) {

        Product existingProduct = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!existingProduct.getSeller().getId().equals(sellerId)) {
            throw new RuntimeException("You can only edit your own products");
        }

        existingProduct.setName(updatedProduct.getName());
        existingProduct.setDescription(updatedProduct.getDescription());
        existingProduct.setPrice(updatedProduct.getPrice());
        existingProduct.setStock(updatedProduct.getStock());
        existingProduct.setImageUrl(updatedProduct.getImageUrl());
        existingProduct.setCategory(updatedProduct.getCategory());

        return productRepository.save(existingProduct);
    }

    public void deleteProduct(Long productId, Long sellerId) {

        Product existingProduct = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!existingProduct.getSeller().getId().equals(sellerId)) {
            throw new RuntimeException("You can only delete your own products");
        }

        productRepository.delete(existingProduct);
    }
}