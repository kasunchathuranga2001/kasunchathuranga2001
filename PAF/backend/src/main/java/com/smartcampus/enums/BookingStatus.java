package com.smartcampus.enums;

/**
 * Booking status workflow: PENDING → APPROVED/REJECTED, APPROVED → CANCELLED
 */
public enum BookingStatus {
    PENDING,
    APPROVED,
    REJECTED,
    CANCELLED
}
