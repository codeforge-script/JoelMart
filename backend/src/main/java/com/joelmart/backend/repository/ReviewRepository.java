package com.joelmart.backend.repository;

import com.joelmart.backend.entity.Product;
import com.joelmart.backend.entity.Review;
import com.joelmart.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByProduct(Product product);

    Optional<Review> findByBuyerAndProduct(User buyer, Product product);
}