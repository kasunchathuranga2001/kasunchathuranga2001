package com.smartcampus.controller;

import com.smartcampus.dto.ApiResponse;
import com.smartcampus.dto.BookingDTO;
import com.smartcampus.enums.BookingStatus;
import com.smartcampus.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * REST Controller for Booking Management
 * Module B - Booking Management
 */
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@Tag(name = "Bookings", description = "Booking Management APIs")
public class BookingController {

    private final BookingService bookingService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all bookings (Admin only)")
    public ResponseEntity<ApiResponse<List<BookingDTO>>> getAllBookings() {
        List<BookingDTO> bookings = bookingService.getAllBookings();
        return ResponseEntity.ok(ApiResponse.success(bookings));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get booking by ID")
    public ResponseEntity<ApiResponse<BookingDTO>> getBookingById(@PathVariable Long id) {
        BookingDTO booking = bookingService.getBookingById(id);
        return ResponseEntity.ok(ApiResponse.success(booking));
    }

    @GetMapping("/my-bookings")
    @Operation(summary = "Get current user's bookings")
    public ResponseEntity<ApiResponse<List<BookingDTO>>> getMyBookings(
            @AuthenticationPrincipal Jwt jwt) {
        Long userId = Long.parseLong(jwt.getSubject());
        List<BookingDTO> bookings = bookingService.getUserBookings(userId);
        return ResponseEntity.ok(ApiResponse.success(bookings));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get bookings by user ID (Admin only)")
    public ResponseEntity<ApiResponse<List<BookingDTO>>> getUserBookings(@PathVariable Long userId) {
        List<BookingDTO> bookings = bookingService.getUserBookings(userId);
        return ResponseEntity.ok(ApiResponse.success(bookings));
    }

    @GetMapping("/filter")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Filter bookings (Admin only)")
    public ResponseEntity<ApiResponse<List<BookingDTO>>> filterBookings(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) Long resourceId) {
        List<BookingDTO> bookings = bookingService.filterBookings(status, date, resourceId);
        return ResponseEntity.ok(ApiResponse.success(bookings));
    }

    @PostMapping
    @Operation(summary = "Create a new booking request")
    public ResponseEntity<ApiResponse<BookingDTO>> createBooking(
            @Valid @RequestBody BookingDTO dto,
            @AuthenticationPrincipal Jwt jwt) {
        Long userId = Long.parseLong(jwt.getSubject());
        BookingDTO booking = bookingService.createBooking(dto, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Booking request submitted", booking));
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Approve a booking request (Admin only)")
    public ResponseEntity<ApiResponse<BookingDTO>> approveBooking(
            @PathVariable Long id,
            @RequestParam(required = false) String remarks,
            @AuthenticationPrincipal Jwt jwt) {
        Long adminId = Long.parseLong(jwt.getSubject());
        BookingDTO booking = bookingService.approveBooking(id, adminId, remarks);
        return ResponseEntity.ok(ApiResponse.success("Booking approved", booking));
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Reject a booking request (Admin only)")
    public ResponseEntity<ApiResponse<BookingDTO>> rejectBooking(
            @PathVariable Long id,
            @RequestParam String reason,
            @AuthenticationPrincipal Jwt jwt) {
        Long adminId = Long.parseLong(jwt.getSubject());
        BookingDTO booking = bookingService.rejectBooking(id, adminId, reason);
        return ResponseEntity.ok(ApiResponse.success("Booking rejected", booking));
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Cancel an approved booking")
    public ResponseEntity<ApiResponse<BookingDTO>> cancelBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt) {
        Long userId = Long.parseLong(jwt.getSubject());
        BookingDTO booking = bookingService.cancelBooking(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled", booking));
    }
}
