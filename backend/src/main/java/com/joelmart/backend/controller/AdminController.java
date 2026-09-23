package com.joelmart.backend.controller;

import com.joelmart.backend.entity.Order;
import com.joelmart.backend.entity.Product;
import com.joelmart.backend.entity.User;
import com.joelmart.backend.repository.OrderRepository;
import com.joelmart.backend.repository.ProductRepository;
import com.joelmart.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    public AdminController(
            UserRepository userRepository,
            ProductRepository productRepository,
            OrderRepository orderRepository) {

        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(
            @RequestParam Long adminId) {

        User admin = userRepository.findById(adminId)
                .orElseThrow(() ->
                        new RuntimeException("Admin not found"));

        if (admin.getRole() != User.Role.ADMIN) {
            return ResponseEntity.status(403)
                    .body("Only admins can view users");
        }

        List<Map<String, Object>> users = new ArrayList<>();

        for (User user : userRepository.findAll()) {

            Map<String, Object> userData = new HashMap<>();

            userData.put("id", user.getId());
            userData.put("fullName", user.getFullName());
            userData.put("email", user.getEmail());
            userData.put("role", user.getRole().toString());

            users.add(userData);
        }

        return ResponseEntity.ok(users);
    }

    @GetMapping("/products")
    public ResponseEntity<?> getAllProducts(
            @RequestParam Long adminId) {

        User admin = userRepository.findById(adminId)
                .orElseThrow(() ->
                        new RuntimeException("Admin not found"));

        if (admin.getRole() != User.Role.ADMIN) {
            return ResponseEntity.status(403)
                    .body("Only admins can view products");
        }

        List<Map<String, Object>> products = new ArrayList<>();

        for (Product product : productRepository.findAll()) {

            Map<String, Object> productData = new HashMap<>();

            productData.put("id", product.getId());
            productData.put("name", product.getName());
            productData.put("description", product.getDescription());
            productData.put("price", product.getPrice());
            productData.put("stock", product.getStock());
            productData.put("category", product.getCategory());
            productData.put("imageUrl", product.getImageUrl());

            if (product.getSeller() != null) {

                productData.put(
                        "sellerName",
                        product.getSeller().getFullName()
                );

                productData.put(
                        "sellerId",
                        product.getSeller().getId()
                );

            } else {

                productData.put(
                        "sellerName",
                        "No Seller"
                );

                productData.put(
                        "sellerId",
                        null
                );
            }

            products.add(productData);
        }

        return ResponseEntity.ok(products);
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getAllOrders(
            @RequestParam Long adminId) {

        User admin = userRepository.findById(adminId)
                .orElseThrow(() ->
                        new RuntimeException("Admin not found"));

        if (admin.getRole() != User.Role.ADMIN) {
            return ResponseEntity.status(403)
                    .body("Only admins can view orders");
        }

        List<Map<String, Object>> orders = new ArrayList<>();

        for (Order order : orderRepository.findAll()) {

            Map<String, Object> orderData = new HashMap<>();

            orderData.put("id", order.getId());
            orderData.put("totalAmount", order.getTotalAmount());
            orderData.put("status", order.getStatus());

            orderData.put(
                    "shippingAddress",
                    order.getShippingAddress()
            );

            orderData.put(
                    "createdAt",
                    order.getCreatedAt()
            );

            if (order.getBuyer() != null) {

                orderData.put(
                        "buyerName",
                        order.getBuyer().getFullName()
                );

                orderData.put(
                        "buyerId",
                        order.getBuyer().getId()
                );

            } else {

                orderData.put(
                        "buyerName",
                        "Unknown Buyer"
                );

                orderData.put(
                        "buyerId",
                        null
                );
            }

            orders.add(orderData);
        }

        return ResponseEntity.ok(orders);
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<?> updateUserRole(
            @PathVariable Long userId,
            @RequestParam Long adminId,
            @RequestParam User.Role role) {

        User admin = userRepository.findById(adminId)
                .orElseThrow(() ->
                        new RuntimeException("Admin not found"));

        if (admin.getRole() != User.Role.ADMIN) {
            return ResponseEntity.status(403)
                    .body("Only admins can change user roles");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        user.setRole(role);

        userRepository.save(user);

        return ResponseEntity.ok(
                "User role updated successfully"
        );
    }

    @PutMapping("/products/{productId}")
    public ResponseEntity<?> updateProduct(
            @PathVariable Long productId,
            @RequestParam Long adminId,
            @RequestBody Product updatedProduct) {

        User admin = userRepository.findById(adminId)
                .orElseThrow(() ->
                        new RuntimeException("Admin not found"));

        if (admin.getRole() != User.Role.ADMIN) {
            return ResponseEntity.status(403)
                    .body("Only admins can update products");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new RuntimeException("Product not found"));

        product.setName(updatedProduct.getName());
        product.setDescription(updatedProduct.getDescription());
        product.setPrice(updatedProduct.getPrice());
        product.setStock(updatedProduct.getStock());
        product.setCategory(updatedProduct.getCategory());
        product.setImageUrl(updatedProduct.getImageUrl());

        productRepository.save(product);

        return ResponseEntity.ok(
                "Product updated successfully by admin"
        );
    }

    @DeleteMapping("/products/{productId}")
    public ResponseEntity<?> deleteProduct(
            @PathVariable Long productId,
            @RequestParam Long adminId) {

        User admin = userRepository.findById(adminId)
                .orElseThrow(() ->
                        new RuntimeException("Admin not found"));

        if (admin.getRole() != User.Role.ADMIN) {
            return ResponseEntity.status(403)
                    .body("Only admins can delete products");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new RuntimeException("Product not found"));

        productRepository.delete(product);

        return ResponseEntity.ok(
                "Product deleted successfully by admin"
        );
    }

    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam Long adminId,
            @RequestParam String status) {

        User admin = userRepository.findById(adminId)
                .orElseThrow(() ->
                        new RuntimeException("Admin not found"));

        if (admin.getRole() != User.Role.ADMIN) {
            return ResponseEntity.status(403)
                    .body("Only admins can update order status");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));

        order.setStatus(status);

        orderRepository.save(order);

        return ResponseEntity.ok(
                "Order status updated successfully by admin"
        );
    }
}