package com.joelmart.backend.service;

import com.joelmart.backend.dto.LoginRequest;
import com.joelmart.backend.dto.RegisterRequest;
import com.joelmart.backend.entity.OtpVerification;
import com.joelmart.backend.entity.User;
import com.joelmart.backend.repository.OtpVerificationRepository;
import com.joelmart.backend.repository.UserRepository;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpVerificationRepository otpVerificationRepository;
    private final JavaMailSender mailSender;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            OtpVerificationRepository otpVerificationRepository,
            JavaMailSender mailSender) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.otpVerificationRepository = otpVerificationRepository;
        this.mailSender = mailSender;
    }

    @Transactional
    public User registerUser(RegisterRequest request) {

        User user =
                userRepository.findByEmail(
                        request.getEmail()
                ).orElse(null);

        if (user != null) {

            if (
                    Boolean.TRUE.equals(
                            user.getEmailVerified()
                    )
            ) {

                throw new RuntimeException(
                        "Email already registered"
                );
            }

            user.setFullName(
                    request.getFullName()
            );

            user.setPasswordHash(
                    passwordEncoder.encode(
                            request.getPassword()
                    )
            );

            user.setRole(
                    User.Role.BUYER
            );

            user.setCreatedAt(
                    LocalDateTime.now()
            );

            user.setEmailVerified(
                    false
            );

            userRepository.save(user);

        } else {

            user = new User();

            user.setFullName(
                    request.getFullName()
            );

            user.setEmail(
                    request.getEmail()
            );

            user.setPasswordHash(
                    passwordEncoder.encode(
                            request.getPassword()
                    )
            );

            user.setRole(
                    User.Role.BUYER
            );

            user.setCreatedAt(
                    LocalDateTime.now()
            );

            user.setEmailVerified(
                    false
            );

            user =
                    userRepository.save(user);
        }

        String otp =
                String.format(
                        "%06d",
                        ThreadLocalRandom.current()
                                .nextInt(
                                        100000,
                                        1000000
                                )
                );

        OtpVerification otpVerification =
                otpVerificationRepository
                        .findByUser(user)
                        .orElse(null);

        if (otpVerification == null) {

            otpVerification =
                    new OtpVerification();

            otpVerification.setUser(
                    user
            );
        }

        otpVerification.setOtp(
                otp
        );

        otpVerification.setExpiresAt(
                LocalDateTime.now()
                        .plusMinutes(5)
        );

        otpVerificationRepository.save(
                otpVerification
        );

        sendOtpEmail(
                user.getEmail(),
                user.getFullName(),
                otp
        );

        return user;
    }

    private void sendOtpEmail(
            String email,
            String fullName,
            String otp) {

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setTo(email);

        message.setSubject(
                "JoelMart - Email Verification OTP"
        );

        message.setText(
                "Hello " + fullName + ",\n\n"
                        + "Welcome to JoelMart!\n\n"
                        + "Your email verification OTP is: "
                        + otp + "\n\n"
                        + "This OTP is valid for 5 minutes.\n\n"
                        + "Please do not share this OTP with anyone.\n\n"
                        + "Regards,\n"
                        + "JoelMart Team"
        );

        mailSender.send(message);
    }

    public String verifyOtp(
            String email,
            String otp) {

        User user =
                userRepository.findByEmail(email)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "User not found"
                                )
                        );

        OtpVerification otpVerification =
                otpVerificationRepository
                        .findByUser(user)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "OTP not found or already used"
                                )
                        );

        if (
                otpVerification
                        .getExpiresAt()
                        .isBefore(
                                LocalDateTime.now()
                        )
        ) {

            otpVerificationRepository
                    .delete(otpVerification);

            throw new RuntimeException(
                    "OTP has expired"
            );
        }

        if (
                !otpVerification
                        .getOtp()
                        .equals(otp)
        ) {

            throw new RuntimeException(
                    "Invalid OTP"
            );
        }

        user.setEmailVerified(
                true
        );

        userRepository.save(user);

        otpVerificationRepository
                .delete(otpVerification);

        return "Email verified successfully";
    }

    public User loginUser(
            LoginRequest request) {

        User user =
                userRepository.findByEmail(
                        request.getEmail()
                )
                .orElseThrow(
                        () -> new RuntimeException(
                                "Invalid email or password"
                        )
                );

        if (
                !passwordEncoder.matches(
                        request.getPassword(),
                        user.getPasswordHash()
                )
        ) {

            throw new RuntimeException(
                    "Invalid email or password"
            );
        }

        if (
                Boolean.FALSE.equals(
                        user.getEmailVerified()
                )
        ) {

            throw new RuntimeException(
                    "Please verify your email with the OTP before logging in."
            );
        }

        return user;
    }
}