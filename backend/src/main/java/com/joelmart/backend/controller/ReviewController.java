package com.joelmart.backend.controller;

import com.joelmart.backend.entity.Review;
import com.joelmart.backend.service.ReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<Review> addReview(
            @RequestParam Long buyerId,
            @RequestParam Long productId,
            @RequestParam Integer rating,
            @RequestParam(required = false) String comment) {

        Review review = reviewService.addReview(
                buyerId,
                productId,
                rating,
                comment
        );

        return ResponseEntity.ok(review);
    }

    @GetMapping
    public ResponseEntity<List<Review>> getProductReviews(
            @RequestParam Long productId) {

        return ResponseEntity.ok(
                reviewService.getProductReviews(productId)
        );
    }
}