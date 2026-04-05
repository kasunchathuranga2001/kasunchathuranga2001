package com.smartcampus.service;

import com.smartcampus.dto.NotificationDTO;
import com.smartcampus.entity.*;
import com.smartcampus.enums.NotificationType;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.repository.NotificationRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing notifications
 * Module D - Notifications
 */
@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public List<NotificationDTO> getUserNotifications(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return notificationRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<NotificationDTO> getUnreadNotifications(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return notificationRepository.findByUserAndReadFalseOrderByCreatedAtDesc(user).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return notificationRepository.countByUserAndReadFalse(user);
    }

    public NotificationDTO markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));
        notification.setRead(true);
        notification = notificationRepository.save(notification);
        return convertToDTO(notification);
    }

    public void markAllAsRead(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        List<Notification> unread = notificationRepository.findByUserAndReadFalseOrderByCreatedAtDesc(user);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    public void createBookingApprovalNotification(Booking booking) {
        createNotification(
                booking.getUser(),
                "Booking Approved",
                "Your booking for " + booking.getResource().getName() + " on " + 
                        booking.getBookingDate() + " has been approved.",
                NotificationType.BOOKING_APPROVED,
                booking.getId()
        );
    }

    public void createBookingRejectionNotification(Booking booking) {
        createNotification(
                booking.getUser(),
                "Booking Rejected",
                "Your booking for " + booking.getResource().getName() + " on " + 
                        booking.getBookingDate() + " has been rejected. Reason: " + booking.getAdminRemarks(),
                NotificationType.BOOKING_REJECTED,
                booking.getId()
        );
    }

    public void createTicketStatusChangeNotification(Ticket ticket) {
        createNotification(
                ticket.getCreatedBy(),
                "Ticket Status Updated",
                "Your ticket '" + ticket.getTitle() + "' status has been changed to " + ticket.getStatus(),
                NotificationType.TICKET_STATUS_CHANGED,
                ticket.getId()
        );
    }

    public void createTicketAssignmentNotification(Ticket ticket) {
        if (ticket.getAssignedTo() != null) {
            createNotification(
                    ticket.getAssignedTo(),
                    "Ticket Assigned",
                    "You have been assigned to ticket: " + ticket.getTitle(),
                    NotificationType.TICKET_ASSIGNED,
                    ticket.getId()
            );
        }
    }

    public void createNewCommentNotification(Comment comment) {
        createNotification(
                comment.getTicket().getCreatedBy(),
                "New Comment",
                comment.getAuthor().getName() + " commented on your ticket: " + comment.getTicket().getTitle(),
                NotificationType.NEW_COMMENT,
                comment.getTicket().getId()
        );
    }

    private void createNotification(User user, String title, String message, 
                                     NotificationType type, Long referenceId) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .referenceId(referenceId)
                .read(false)
                .build();
        notificationRepository.save(notification);
    }

    private NotificationDTO convertToDTO(Notification notification) {
        return NotificationDTO.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .userId(notification.getUser().getId())
                .referenceId(notification.getReferenceId())
                .read(notification.getRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
