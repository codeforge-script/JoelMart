package com.joelmart.backend.service;

import com.joelmart.backend.entity.Order;
import com.joelmart.backend.entity.Payment;
import com.joelmart.backend.entity.User;
import com.joelmart.backend.repository.OrderRepository;
import com.joelmart.backend.repository.PaymentRepository;
import com.joelmart.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public PaymentService(PaymentRepository paymentRepository,
                          OrderRepository orderRepository,
                          UserRepository userRepository) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Payment makePayment(Long orderId,
                               Long buyerId,
                               String paymentMethod) {

        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new RuntimeException("Buyer not found"));

        if (buyer.getRole() != User.Role.BUYER) {
            throw new RuntimeException("Only buyers can make payments");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getBuyer().getId().equals(buyerId)) {
            throw new RuntimeException(
                    "You can only pay for your own orders"
            );
        }

        if (paymentRepository.findByOrder(order).isPresent()) {
            throw new RuntimeException("Payment already exists for this order");
        }

        if (paymentMethod == null || paymentMethod.isBlank()) {
            throw new RuntimeException("Payment method is required");
        }

        paymentMethod = paymentMethod.toUpperCase();

        if (!paymentMethod.equals("CARD")
                && !paymentMethod.equals("UPI")
                && !paymentMethod.equals("COD")) {
            throw new RuntimeException(
                    "Payment method must be CARD, UPI, or COD"
            );
        }

        Payment payment = new Payment();

        payment.setOrder(order);
        payment.setPaymentMethod(paymentMethod);
        payment.setAmount(order.getTotalAmount());

        if (paymentMethod.equals("COD")) {
            payment.setStatus("PENDING");
            payment.setTransactionId(null);
            payment.setPaidAt(null);

            order.setStatus("CONFIRMED");

        } else {
            payment.setStatus("SUCCESS");
            payment.setTransactionId(
                    "TXN-" + UUID.randomUUID().toString()
                            .substring(0, 8)
                            .toUpperCase()
            );
            payment.setPaidAt(LocalDateTime.now());

            order.setStatus("PAID");
        }

        orderRepository.save(order);

        return paymentRepository.save(payment);
    }

    public Payment getPaymentByOrder(Long orderId, Long buyerId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getBuyer().getId().equals(buyerId)) {
            throw new RuntimeException(
                    "You can only view your own payment"
            );
        }

        return paymentRepository.findByOrder(order)
                .orElseThrow(() -> new RuntimeException(
                        "Payment not found"
                ));
    }
}