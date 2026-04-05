package com.smartcampus.repository;

import com.smartcampus.entity.Booking;
import com.smartcampus.entity.Resource;
import com.smartcampus.entity.User;
import com.smartcampus.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUser(User user);
    List<Booking> findByResource(Resource resource);
    List<Booking> findByStatus(BookingStatus status);
    List<Booking> findByBookingDate(LocalDate date);
    List<Booking> findByUserAndStatus(User user, BookingStatus status);
    
    @Query("SELECT b FROM Booking b WHERE b.resource = :resource AND b.bookingDate = :date " +
           "AND b.status IN ('PENDING', 'APPROVED') " +
           "AND ((b.startTime <= :startTime AND b.endTime > :startTime) " +
           "OR (b.startTime < :endTime AND b.endTime >= :endTime) " +
           "OR (b.startTime >= :startTime AND b.endTime <= :endTime))")
    List<Booking> findConflictingBookings(
            @Param("resource") Resource resource,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime);
    
    @Query("SELECT b FROM Booking b WHERE " +
           "(:status IS NULL OR b.status = :status) AND " +
           "(:date IS NULL OR b.bookingDate = :date) AND " +
           "(:resourceId IS NULL OR b.resource.id = :resourceId)")
    List<Booking> filterBookings(
            @Param("status") BookingStatus status,
            @Param("date") LocalDate date,
            @Param("resourceId") Long resourceId);
}
