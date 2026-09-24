package com.joelmart.backend.controller;

import com.joelmart.backend.dto.LoginRequest;
import com.joelmart.backend.dto.LoginResponse;
import com.joelmart.backend.dto.RegisterRequest;
import com.joelmart.backend.dto.VerifyOtpRequest;
import com.joelmart.backend.entity.User;
import com.joelmart.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(
            @RequestBody RegisterRequest request) {

        User user =
                userService.registerUser(request);

        return ResponseEntity.ok(
                "OTP sent successfully to your email"
        );
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(
            @RequestBody VerifyOtpRequest request) {

        String message =
                userService.verifyOtp(
                        request.getEmail(),
                        request.getOtp()
                );

        return ResponseEntity.ok(message);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> loginUser(
            @RequestBody LoginRequest request) {

        User user =
                userService.loginUser(request);

        LoginResponse response =
                new LoginResponse(
                        user.getId(),
                        user.getFullName(),
                        user.getEmail(),
                        user.getRole()
                );

        return ResponseEntity.ok(response);
    }
}