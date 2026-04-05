package com.smartcampus.dto;

import com.smartcampus.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDTO {
    private Long id;
    private String title;
    private String message;
    private NotificationType type;
    private Long userId;
    private Long referenceId;
    private Boolean read;
    private LocalDateTime createdAt;
}
