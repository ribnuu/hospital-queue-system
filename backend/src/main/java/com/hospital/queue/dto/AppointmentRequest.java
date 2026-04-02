package com.hospital.queue.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AppointmentRequest {
    @NotBlank private String patientName;
    @NotBlank private String patientEmail;
    @NotBlank private String doctorName;
    @NotBlank private String department;
    @NotNull  private LocalDateTime scheduledTime;
}
