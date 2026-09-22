package com.joelmart.backend.dto;

import com.joelmart.backend.entity.User;

public class LoginResponse {

    private Long id;
    private String fullName;
    private String email;
    private User.Role role;

    public LoginResponse(Long id, String fullName, String email, User.Role role) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
    }

    public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public User.Role getRole() {
        return role;
    }
}