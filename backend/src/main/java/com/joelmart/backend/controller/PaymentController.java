package com.joelmart.backend.controller;

import com.joelmart.backend.entity.Payment;
import com.joelmart.backend.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping
    public ResponseEntity<Payment> makePayment(
            @RequestParam Long orderId,
            @RequestParam Long buyerId,
            @RequestParam String paymentMethod) {

        Payment payment = paymentService.makePayment(
                orderId,
                buyerId,
                paymentMethod
        );

        return ResponseEntity.ok(payment);
    }

    @GetMapping
    public ResponseEntity<Payment> getPaymentByOrder(
            @RequestParam Long orderId,
            @RequestParam Long buyerId) {

        return ResponseEntity.ok(
                paymentService.getPaymentByOrder(orderId, buyerId)
        );
    }
}