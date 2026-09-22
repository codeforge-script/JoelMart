package com.joelmart.backend.controller;

import com.joelmart.backend.entity.Order;
import com.joelmart.backend.entity.OrderItem;
import com.joelmart.backend.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
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
}