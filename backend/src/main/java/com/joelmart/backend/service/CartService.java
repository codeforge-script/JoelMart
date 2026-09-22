package com.joelmart.backend.service;

import com.joelmart.backend.entity.CartItem;
import com.joelmart.backend.entity.Product;
import com.joelmart.backend.entity.User;
import com.joelmart.backend.repository.CartItemRepository;
import com.joelmart.backend.repository.ProductRepository;
import com.joelmart.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public CartService(CartItemRepository cartItemRepository,
                       UserRepository userRepository,
                       ProductRepository productRepository) {
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    public CartItem addToCart(Long buyerId, Long productId, Integer quantity) {

        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new RuntimeException("Buyer not found"));

        if (buyer.getRole() != User.Role.BUYER) {
            throw new RuntimeException("Only buyers can use the cart");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (quantity == null || quantity <= 0) {
            throw new RuntimeException("Quantity must be greater than 0");
        }

        if (product.getStock() < quantity) {
            throw new RuntimeException("Insufficient stock");
        }

        CartItem cartItem = cartItemRepository
                .findByBuyerAndProduct(buyer, product)
                .orElse(null);

        if (cartItem != null) {

            int newQuantity = cartItem.getQuantity() + quantity;

            if (newQuantity > product.getStock()) {
                throw new RuntimeException("Insufficient stock");
            }

            cartItem.setQuantity(newQuantity);

        } else {

            cartItem = new CartItem();
            cartItem.setBuyer(buyer);
            cartItem.setProduct(product);
            cartItem.setQuantity(quantity);
            cartItem.setAddedAt(LocalDateTime.now());
        }

        return cartItemRepository.save(cartItem);
    }

    public List<CartItem> getCart(Long buyerId) {

        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new RuntimeException("Buyer not found"));

        if (buyer.getRole() != User.Role.BUYER) {
            throw new RuntimeException("Only buyers can view the cart");
        }

        return cartItemRepository.findByBuyer(buyer);
    }

    public CartItem updateQuantity(Long cartItemId,
                                   Long buyerId,
                                   Integer quantity) {

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!cartItem.getBuyer().getId().equals(buyerId)) {
            throw new RuntimeException("You can only update your own cart");
        }

        if (quantity == null || quantity <= 0) {
            throw new RuntimeException("Quantity must be greater than 0");
        }

        if (quantity > cartItem.getProduct().getStock()) {
            throw new RuntimeException("Insufficient stock");
        }

        cartItem.setQuantity(quantity);

        return cartItemRepository.save(cartItem);
    }

    public void removeFromCart(Long cartItemId, Long buyerId) {

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!cartItem.getBuyer().getId().equals(buyerId)) {
            throw new RuntimeException("You can only remove items from your own cart");
        }

        cartItemRepository.delete(cartItem);
    }
}