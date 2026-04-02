package com.hospital.queue.dto;

import com.hospital.queue.model.Appointment;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data @Builder
public class AppointmentResponse {
    private Long id;
    private String patientName;
    private String patientEmail;
    private String doctorName;
    private String department;
    private LocalDateTime scheduledTime;
    private Integer queueNumber;
    private Integer predictedWaitMinutes;
    private String status;
    private LocalDateTime createdAt;

    public static AppointmentResponse from(Appointment a) {
        return AppointmentResponse.builder()
            .id(a.getId())
            .patientName(a.getPatient().getName())
            .patientEmail(a.getPatient().getEmail())
            .doctorName(a.getDoctorName())
            .department(a.getDepartment())
            .scheduledTime(a.getScheduledTime())
            .queueNumber(a.getQueueNumber())
            .predictedWaitMinutes(a.getPredictedWaitMinutes())
            .status(a.getStatus().name())
            .createdAt(a.getCreatedAt())
            .build();
    }
}
