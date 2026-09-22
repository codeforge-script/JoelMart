package com.joelmart.backend.service;

import com.joelmart.backend.entity.OrderItem;
import com.joelmart.backend.entity.Product;
import com.joelmart.backend.entity.Review;
import com.joelmart.backend.entity.User;
import com.joelmart.backend.repository.OrderItemRepository;
import com.joelmart.backend.repository.ProductRepository;
import com.joelmart.backend.repository.ReviewRepository;
import com.joelmart.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;

    public ReviewService(ReviewRepository reviewRepository,
                         UserRepository userRepository,
                         ProductRepository productRepository,
                         OrderItemRepository orderItemRepository) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.orderItemRepository = orderItemRepository;
    }

    public Review addReview(Long buyerId,
                            Long productId,
                            Integer rating,
                            String comment) {

        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new RuntimeException("Buyer not found"));

        if (buyer.getRole() != User.Role.BUYER) {
            throw new RuntimeException("Only buyers can add reviews");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (rating == null || rating < 1 || rating > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }

        boolean purchased = orderItemRepository.findAll()
                .stream()
                .anyMatch(orderItem ->
                        orderItem.getOrder().getBuyer().getId().equals(buyerId)
                                && orderItem.getProduct().getId().equals(productId)
                );

        if (!purchased) {
            throw new RuntimeException(
                    "You can only review products you have purchased"
            );
        }

        if (reviewRepository.findByBuyerAndProduct(buyer, product).isPresent()) {
            throw new RuntimeException(
                    "You have already reviewed this product"
            );
        }

        Review review = new Review();

        review.setBuyer(buyer);
        review.setProduct(product);
        review.setRating(rating);
        review.setComment(comment);
        review.setCreatedAt(LocalDateTime.now());

        return reviewRepository.save(review);
    }

    public List<Review> getProductReviews(Long productId) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        return reviewRepository.findByProduct(product);
    }
}