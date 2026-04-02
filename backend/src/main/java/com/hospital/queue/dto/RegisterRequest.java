package com.hospital.queue.dto;
import com.hospital.queue.model.User;
import lombok.*;
@Data @NoArgsConstructor @AllArgsConstructor
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private User.Role role;
}
