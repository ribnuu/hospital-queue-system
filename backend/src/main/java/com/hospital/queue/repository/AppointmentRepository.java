package com.hospital.queue.repository;

import com.hospital.queue.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByDepartmentOrderByQueueNumber(String department);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.department = :dept AND CAST(a.scheduledTime AS date) = :date")
    int countByDepartmentAndDate(@Param("dept") String dept, @Param("date") LocalDate date);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.department = :dept AND a.status IN (:s1, :s2)")
    long countActiveByDepartment(@Param("dept") String dept,
                                  @Param("s1") Appointment.AppointmentStatus s1,
                                  @Param("s2") Appointment.AppointmentStatus s2);

    @Query("SELECT a FROM Appointment a WHERE a.department = :dept AND a.status = :status AND a.createdAt >= :since")
    List<Appointment> findCompletedSince(@Param("dept") String dept,
                                         @Param("since") LocalDateTime since,
                                         @Param("status") Appointment.AppointmentStatus status);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.status IN ('SCHEDULED','CHECKED_IN','IN_PROGRESS')")
    long countActiveAppointments();

    @Query("SELECT a.department, COUNT(a) FROM Appointment a GROUP BY a.department")
    List<Object[]> countByDepartment();
}
