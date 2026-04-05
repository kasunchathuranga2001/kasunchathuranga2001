package com.smartcampus.dto;

import com.smartcampus.enums.BookingStatus;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingDTO {
    private Long id;
    
    @NotNull(message = "Resource ID is required")
    private Long resourceId;
    
    private String resourceName;
    
    private Long userId;
    private String userName;
    
    @NotNull(message = "Booking date is required")
    @FutureOrPresent(message = "Booking date must be today or in the future")
    private LocalDate bookingDate;
    
    @NotNull(message = "Start time is required")
    private LocalTime startTime;
    
    @NotNull(message = "End time is required")
    private LocalTime endTime;
    
    @NotBlank(message = "Purpose is required")
    private String purpose;
    
    @Min(value = 1, message = "Expected attendees must be at least 1")
    private Integer expectedAttendees;
    
    private BookingStatus status;
    private String adminRemarks;
}
