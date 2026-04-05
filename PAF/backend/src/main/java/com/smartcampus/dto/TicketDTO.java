package com.smartcampus.dto;

import com.smartcampus.enums.TicketCategory;
import com.smartcampus.enums.TicketPriority;
import com.smartcampus.enums.TicketStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketDTO {
    private Long id;
    
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotBlank(message = "Description is required")
    @Size(max = 2000, message = "Description cannot exceed 2000 characters")
    private String description;
    
    @NotNull(message = "Category is required")
    private TicketCategory category;
    
    @NotNull(message = "Priority is required")
    private TicketPriority priority;
    
    private TicketStatus status;
    
    private Long resourceId;
    private String resourceName;
    
    private String location;
    
    private Long createdById;
    private String createdByName;
    
    private Long assignedToId;
    private String assignedToName;
    
    @Email(message = "Invalid email format")
    private String contactEmail;
    
    private String contactPhone;
    
    private String resolutionNotes;
    private String rejectionReason;
    
    @Size(max = 3, message = "Maximum 3 attachments allowed")
    private List<String> attachments;
    
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
}
