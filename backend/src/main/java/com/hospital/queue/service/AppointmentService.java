package com.hospital.queue.service;

import com.hospital.queue.dto.AppointmentRequest;
import com.hospital.queue.dto.AppointmentResponse;
import com.hospital.queue.model.Appointment;
import com.hospital.queue.model.Patient;
import com.hospital.queue.repository.AppointmentRepository;
import com.hospital.queue.repository.PatientRepository;
import com.hospital.queue.websocket.QueueNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final WaitTimePredictorService waitTimePredictorService;
    private final QueueNotificationService notificationService;

    @Transactional
    public AppointmentResponse book(AppointmentRequest req) {
        Patient patient = patientRepository.findByEmail(req.getPatientEmail())
            .orElseThrow(() -> new RuntimeException("Patient not found"));

        // AI: predict wait time before saving
        int predicted = waitTimePredictorService.predict(req.getDepartment(), req.getScheduledTime());

        // Assign queue number within department
        int queueNo = appointmentRepository.countByDepartmentAndDate(
            req.getDepartment(), req.getScheduledTime().toLocalDate()) + 1;

        Appointment appt = Appointment.builder()
            .patient(patient)
            .doctorName(req.getDoctorName())
            .department(req.getDepartment())
            .scheduledTime(req.getScheduledTime())
            .queueNumber(queueNo)
            .predictedWaitMinutes(predicted)
            .status(Appointment.AppointmentStatus.SCHEDULED)
            .build();

        appointmentRepository.save(appt);

        // Notify via WebSocket
        notificationService.broadcastQueueUpdate(req.getDepartment());

        return AppointmentResponse.from(appt);
    }

    @Transactional
    public AppointmentResponse updateStatus(Long id, Appointment.AppointmentStatus newStatus) {
        Appointment appt = appointmentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Appointment not found"));

        appt.setStatus(newStatus);

        // Recalculate AI wait time on check-in
        if (newStatus == Appointment.AppointmentStatus.CHECKED_IN) {
            int fresh = waitTimePredictorService.predict(appt.getDepartment(), LocalDateTime.now());
            appt.setPredictedWaitMinutes(fresh);
            // Smart push notification: tell patient their updated wait time
            notificationService.sendSmartAlert(appt.getPatient().getEmail(),
                "✅ You're checked in! Estimated wait: " + fresh + " mins — head to " + appt.getDepartment());
        }

        appointmentRepository.save(appt);
        notificationService.broadcastQueueUpdate(appt.getDepartment());
        return AppointmentResponse.from(appt);
    }

    public List<AppointmentResponse> getByDepartment(String department) {
        return appointmentRepository.findByDepartmentOrderByQueueNumber(department)
            .stream().map(AppointmentResponse::from).collect(Collectors.toList());
    }

    public List<AppointmentResponse> getAll() {
        return appointmentRepository.findAll()
            .stream().map(AppointmentResponse::from).collect(Collectors.toList());
    }
}
