package com.joelmart.backend.controller;

import com.joelmart.backend.entity.CartItem;
import com.joelmart.backend.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @PostMapping
    public ResponseEntity<CartItem> addToCart(
            @RequestParam Long buyerId,
            @RequestParam Long productId,
            @RequestParam Integer quantity) {

        CartItem cartItem =
                cartService.addToCart(buyerId, productId, quantity);

        return ResponseEntity.ok(cartItem);
    }

    @GetMapping
    public ResponseEntity<List<CartItem>> getCart(
            @RequestParam Long buyerId) {

        return ResponseEntity.ok(
                cartService.getCart(buyerId)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<CartItem> updateQuantity(
            @PathVariable Long id,
            @RequestParam Long buyerId,
            @RequestParam Integer quantity) {

        CartItem cartItem =
                cartService.updateQuantity(id, buyerId, quantity);

        return ResponseEntity.ok(cartItem);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> removeFromCart(
            @PathVariable Long id,
            @RequestParam Long buyerId) {

        cartService.removeFromCart(id, buyerId);

        return ResponseEntity.ok("Product removed from cart successfully");
    }
}