package com.joelmart.backend.controller;

import com.joelmart.backend.entity.Order;
import com.joelmart.backend.entity.OrderItem;
import com.joelmart.backend.entity.User;
import com.joelmart.backend.repository.OrderRepository;
import com.joelmart.backend.repository.UserRepository;
import com.joelmart.backend.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    public OrderController(
            OrderService orderService,
            UserRepository userRepository,
            OrderRepository orderRepository) {

        this.orderService = orderService;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
    }

    @PostMapping
    public ResponseEntity<Order> createOrder(
            @RequestParam Long buyerId,
            @RequestParam String shippingAddress) {

        Order order = orderService.createOrder(
                buyerId,
                shippingAddress
        );

        return ResponseEntity.ok(order);
    }

    @GetMapping
    public ResponseEntity<List<Order>> getOrdersByBuyer(
            @RequestParam Long buyerId) {

        return ResponseEntity.ok(
                orderService.getOrdersByBuyer(buyerId)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(
            @PathVariable Long id,
            @RequestParam Long buyerId) {

        return ResponseEntity.ok(
                orderService.getOrderById(id, buyerId)
        );
    }

    @GetMapping("/seller")
    public ResponseEntity<List<OrderItem>> getSellerOrderItems(
            @RequestParam Long sellerId) {

        return ResponseEntity.ok(
                orderService.getSellerOrderItems(sellerId)
        );
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam Long sellerId,
            @RequestParam String status) {

        Order updatedOrder = orderService.updateOrderStatus(
                id,
                sellerId,
                status
        );

        return ResponseEntity.ok(updatedOrder);
    }

    @PutMapping("/admin/{id}/status")
    public ResponseEntity<?> updateOrderStatusByAdmin(
            @PathVariable Long id,
            @RequestParam Long adminId,
            @RequestParam String status) {

        User admin = userRepository.findById(adminId)
                .orElseThrow(() ->
                        new RuntimeException("Admin not found"));

        if (admin.getRole() != User.Role.ADMIN) {

            return ResponseEntity.status(403)
                    .body("Only admins can update order status");
        }

        Order order = orderRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));

        order.setStatus(status);

        Order savedOrder = orderRepository.save(order);

        return ResponseEntity.ok(savedOrder);
    }
}