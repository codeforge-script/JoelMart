package com.joelmart.backend.repository;

import com.joelmart.backend.entity.Order;
import com.joelmart.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByBuyer(User buyer);
}