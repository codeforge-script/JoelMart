package com.joelmart.backend.repository;

import com.joelmart.backend.entity.Order;
import com.joelmart.backend.entity.OrderItem;
import com.joelmart.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrder(Order order);

    List<OrderItem> findByProduct_Seller(User seller);
}