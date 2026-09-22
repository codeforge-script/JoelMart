package com.joelmart.backend.repository;

import com.joelmart.backend.entity.CartItem;
import com.joelmart.backend.entity.User;
import com.joelmart.backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    List<CartItem> findByBuyer(User buyer);

    Optional<CartItem> findByBuyerAndProduct(User buyer, Product product);
}