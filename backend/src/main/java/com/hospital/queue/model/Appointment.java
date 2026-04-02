package com.hospital.queue.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "doctor_name", nullable = false)
    private String doctorName;

    @Column(name = "department", nullable = false)
    private String department;

    @Column(name = "scheduled_time", nullable = false)
    private LocalDateTime scheduledTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AppointmentStatus status;

    @Column(name = "queue_number")
    private Integer queueNumber;

    /**
     * AI-predicted wait time in minutes (computed by WaitTimePredictorService)
     */
    @Column(name = "predicted_wait_minutes")
    private Integer predictedWaitMinutes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) status = AppointmentStatus.SCHEDULED;
    }

    public enum AppointmentStatus {
        SCHEDULED, CHECKED_IN, IN_PROGRESS, COMPLETED, CANCELLED
    }
}
