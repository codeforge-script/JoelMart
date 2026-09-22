package com.joelmart.backend.service;

import com.joelmart.backend.entity.CartItem;
import com.joelmart.backend.entity.Order;
import com.joelmart.backend.entity.OrderItem;
import com.joelmart.backend.entity.Product;
import com.joelmart.backend.entity.User;
import com.joelmart.backend.repository.CartItemRepository;
import com.joelmart.backend.repository.OrderItemRepository;
import com.joelmart.backend.repository.OrderRepository;
import com.joelmart.backend.repository.UserRepository;
import com.joelmart.backend.repository.ProductRepository;
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
}