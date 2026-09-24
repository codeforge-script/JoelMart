package com.joelmart.backend.repository;

import com.joelmart.backend.entity.OtpVerification;
import com.joelmart.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OtpVerificationRepository
        extends JpaRepository<OtpVerification, Long> {

    Optional<OtpVerification> findByUser(User user);

    void deleteByUser(User user);
}