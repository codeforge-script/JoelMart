package com.joelmart.backend.service;

import com.joelmart.backend.entity.CartItem;
import com.joelmart.backend.entity.Order;
import com.joelmart.backend.entity.OrderItem;
import com.joelmart.backend.entity.Product;
import com.joelmart.backend.entity.User;
import com.joelmart.backend.repository.CartItemRepository;
import com.joelmart.backend.repository.OrderItemRepository;
import com.joelmart.backend.repository.OrderRepository;
import com.joelmart.backend.repository.ProductRepository;
import com.joelmart.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public OrderService(OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        CartItemRepository cartItemRepository,
                        UserRepository userRepository,
                        ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public Order createOrder(Long buyerId, String shippingAddress) {

        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new RuntimeException("Buyer not found"));

        if (buyer.getRole() != User.Role.BUYER) {
            throw new RuntimeException("Only buyers can place orders");
        }

        List<CartItem> cartItems = cartItemRepository.findByBuyer(buyer);

        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (CartItem cartItem : cartItems) {

            Product product = cartItem.getProduct();

            if (product.getStock() < cartItem.getQuantity()) {
                throw new RuntimeException(
                        "Insufficient stock for product: " + product.getName()
                );
            }

            BigDecimal itemTotal = product.getPrice()
                    .multiply(BigDecimal.valueOf(cartItem.getQuantity()));

            totalAmount = totalAmount.add(itemTotal);
        }

        Order order = new Order();

        order.setBuyer(buyer);
        order.setTotalAmount(totalAmount);
        order.setStatus("PENDING");
        order.setShippingAddress(shippingAddress);
        order.setCreatedAt(LocalDateTime.now());

        Order savedOrder = orderRepository.save(order);

        for (CartItem cartItem : cartItems) {

            Product product = cartItem.getProduct();

            OrderItem orderItem = new OrderItem();

            orderItem.setOrder(savedOrder);
            orderItem.setProduct(product);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(product.getPrice());

            orderItemRepository.save(orderItem);

            product.setStock(
                    product.getStock() - cartItem.getQuantity()
            );

            productRepository.save(product);

            cartItemRepository.delete(cartItem);
        }

        return savedOrder;
    }

    public List<Order> getOrdersByBuyer(Long buyerId) {

        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new RuntimeException("Buyer not found"));

        if (buyer.getRole() != User.Role.BUYER) {
            throw new RuntimeException("Only buyers can view orders");
        }

        return orderRepository.findByBuyer(buyer);
    }

    public Order getOrderById(Long orderId, Long buyerId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getBuyer().getId().equals(buyerId)) {
            throw new RuntimeException("You can only view your own orders");
        }

        return order;
    }

    public List<OrderItem> getSellerOrderItems(Long sellerId) {

        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));

        if (seller.getRole() != User.Role.SELLER) {
            throw new RuntimeException("Only sellers can view seller orders");
        }

        return orderItemRepository.findByProduct_Seller(seller);
    }

    public Order updateOrderStatus(Long orderId,
                                   Long sellerId,
                                   String status) {

        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));

        if (seller.getRole() != User.Role.SELLER) {
            throw new RuntimeException("Only sellers can update order status");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        List<OrderItem> orderItems = orderItemRepository.findByOrder(order);

        boolean sellerOwnsOrder = orderItems.stream()
                .anyMatch(item ->
                        item.getProduct().getSeller().getId().equals(sellerId)
                );

        if (!sellerOwnsOrder) {
            throw new RuntimeException(
                    "You can only update orders containing your products"
            );
        }

        String newStatus = status.toUpperCase();

        if (!newStatus.equals("PENDING")
                && !newStatus.equals("CONFIRMED")
                && !newStatus.equals("SHIPPED")
                && !newStatus.equals("DELIVERED")
                && !newStatus.equals("CANCELLED")) {
            throw new RuntimeException(
                    "Invalid order status"
            );
        }

        order.setStatus(newStatus);

        return orderRepository.save(order);
    }
}