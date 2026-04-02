package com.hospital.queue.dto;
import lombok.*;
@Data @NoArgsConstructor @AllArgsConstructor
public class AuthResponse {
    private String token;
    private String name;
    private String email;
    private String role;
}
