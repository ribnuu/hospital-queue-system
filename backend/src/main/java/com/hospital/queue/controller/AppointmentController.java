package com.hospital.queue.controller;

import com.hospital.queue.dto.AppointmentRequest;
import com.hospital.queue.dto.AppointmentResponse;
import com.hospital.queue.model.Appointment;
import com.hospital.queue.service.AppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
@Tag(name = "Appointments", description = "Appointment booking and queue management")
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    @Operation(summary = "Book appointment with AI wait-time prediction")
    public ResponseEntity<AppointmentResponse> book(@Valid @RequestBody AppointmentRequest req) {
        return ResponseEntity.ok(appointmentService.book(req));
    }

    @GetMapping
    @Operation(summary = "Get all appointments")
    public ResponseEntity<List<AppointmentResponse>> getAll() {
        return ResponseEntity.ok(appointmentService.getAll());
    }

    @GetMapping("/department/{dept}")
    @Operation(summary = "Get queue by department")
    public ResponseEntity<List<AppointmentResponse>> getByDepartment(@PathVariable String dept) {
        return ResponseEntity.ok(appointmentService.getByDepartment(dept));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update appointment status (triggers AI re-prediction + WebSocket alert)")
    public ResponseEntity<AppointmentResponse> updateStatus(
        @PathVariable Long id,
        @RequestParam Appointment.AppointmentStatus status
    ) {
        return ResponseEntity.ok(appointmentService.updateStatus(id, status));
    }
}
