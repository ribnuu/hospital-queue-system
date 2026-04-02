package com.hospital.queue.dto;

import com.hospital.queue.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @NoArgsConstructor @AllArgsConstructor
public class AuthRequest {
    private String email;
    private String password;
}

// ---- in same package ----
