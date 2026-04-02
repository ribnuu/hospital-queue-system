package com.hospital.queue.config;

import com.hospital.queue.model.User;
import com.hospital.queue.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedUser("admin@hospital.com", "Admin User", "password", User.Role.ADMIN);
        seedUser("doctor@hospital.com", "Doctor User", "password", User.Role.DOCTOR);
        seedUser("reception@hospital.com", "Reception User", "password", User.Role.RECEPTIONIST);
    }

    private void seedUser(String email, String name, String rawPassword, User.Role role) {
        if (userRepository.findByEmail(email).isPresent()) {
            return;
        }

        User user = User.builder()
            .email(email)
            .name(name)
            .password(passwordEncoder.encode(rawPassword))
            .role(role)
            .build();

        userRepository.save(user);
    }
}
