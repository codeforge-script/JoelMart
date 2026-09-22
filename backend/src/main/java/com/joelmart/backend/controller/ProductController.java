package com.joelmart.backend.controller;

import com.joelmart.backend.entity.Product;
import com.joelmart.backend.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping
    public ResponseEntity<Product> addProduct(
            @RequestParam Long sellerId,
            @RequestBody Product product) {

        Product savedProduct = productService.addProduct(product, sellerId);

        return ResponseEntity.ok(savedProduct);
    }

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(
            @PathVariable Long id) {

        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Product>> searchProducts(
            @RequestParam String name) {

        return ResponseEntity.ok(productService.searchProducts(name));
    }

    @GetMapping("/category")
    public ResponseEntity<List<Product>> getProductsByCategory(
            @RequestParam String category) {

        return ResponseEntity.ok(
                productService.getProductsByCategory(category)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(
            @PathVariable Long id,
            @RequestParam Long sellerId,
            @RequestBody Product product) {

        Product updatedProduct =
                productService.updateProduct(id, product, sellerId);

        return ResponseEntity.ok(updatedProduct);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProduct(
            @PathVariable Long id,
            @RequestParam Long sellerId) {

        productService.deleteProduct(id, sellerId);

        return ResponseEntity.ok("Product deleted successfully");
    }
}