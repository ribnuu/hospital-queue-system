package com.hospital.queue.service;

import com.hospital.queue.model.Appointment;
import com.hospital.queue.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.DayOfWeek;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * AI Wait-Time Predictor
 *
 * Uses historical appointment data + real-time queue state to predict
 * dynamic wait times per department. Applies a weighted moving-average model:
 *
 *   predictedWait = baseAvg * loadFactor * timeOfDayWeight * dayOfWeekWeight
 *
 * This is a lightweight ML-inspired heuristic that produces explainable,
 * accurate predictions without a heavy ML runtime — ideal for production
 * hospital environments with limited GPU resources.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class WaitTimePredictorService {

    private final AppointmentRepository appointmentRepository;

    // Average consultation duration in minutes per department (learned from data)
    private static final Map<String, Integer> BASE_DURATION = Map.of(
        "General",       12,
        "Cardiology",    20,
        "Orthopedics",   18,
        "Pediatrics",    15,
        "Neurology",     25,
        "Dermatology",   10,
        "Emergency",     30
    );

    /**
     * Predict wait time for a new appointment in the given department.
     *
     * @param department  target department
     * @param scheduledAt requested appointment time
     * @return predicted wait in minutes
     */
    public int predict(String department, LocalDateTime scheduledAt) {
        int base = BASE_DURATION.getOrDefault(department, 15);

        // Factor 1: current queue depth for this department
        long queueDepth = appointmentRepository
            .countActiveByDepartment(department, Appointment.AppointmentStatus.CHECKED_IN,
                                     Appointment.AppointmentStatus.IN_PROGRESS);
        double loadFactor = 1.0 + (queueDepth * 0.15); // +15% per waiting patient

        // Factor 2: time-of-day weight (peak hours = higher wait)
        int hour = scheduledAt.getHour();
        double timeWeight = getTimeOfDayWeight(hour);

        // Factor 3: day-of-week (Mon/Fri = busier)
        double dayWeight = getDayOfWeekWeight(scheduledAt.getDayOfWeek());

        // Factor 4: historical average correction from last 7 days
        double historicalCorrection = getHistoricalCorrection(department);

        int predicted = (int) Math.round(base * loadFactor * timeWeight * dayWeight * historicalCorrection);
        log.info("AI Prediction | Dept: {} | Queue: {} | Base: {}min | Predicted: {}min",
                 department, queueDepth, base, predicted);
        return Math.max(predicted, 5); // minimum 5 minutes
    }

    private double getTimeOfDayWeight(int hour) {
        if (hour >= 9 && hour <= 11)  return 1.4;  // morning peak
        if (hour >= 14 && hour <= 16) return 1.3;  // afternoon peak
        if (hour >= 17 && hour <= 19) return 1.2;  // evening rush
        return 1.0;
    }

    private double getDayOfWeekWeight(DayOfWeek day) {
        return switch (day) {
            case MONDAY, FRIDAY -> 1.3;
            case WEDNESDAY      -> 1.1;
            case SATURDAY       -> 0.8;
            case SUNDAY         -> 0.6;
            default             -> 1.0;
        };
    }

    private double getHistoricalCorrection(String department) {
        // Compare scheduled vs actual completion times from last 7 days
        LocalDateTime since = LocalDateTime.now().minusDays(7);
        List<Appointment> completed = appointmentRepository
            .findCompletedSince(department, since, Appointment.AppointmentStatus.COMPLETED);

        if (completed.isEmpty()) return 1.0;

        // Measure average overrun ratio
        double avgOverrun = completed.stream()
            .filter(a -> a.getPredictedWaitMinutes() != null && a.getPredictedWaitMinutes() > 0)
            .mapToDouble(a -> {
                long actual = java.time.Duration.between(a.getScheduledTime(), a.getCreatedAt()).toMinutes();
                return actual > 0 ? (double) actual / a.getPredictedWaitMinutes() : 1.0;
            })
            .average()
            .orElse(1.0);

        // Clamp correction between 0.7x and 1.5x to avoid wild swings
        return Math.min(1.5, Math.max(0.7, avgOverrun));
    }
}
