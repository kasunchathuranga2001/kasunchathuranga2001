package com.smartcampus.dto;

import com.smartcampus.enums.ResourceStatus;
import com.smartcampus.enums.ResourceType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResourceDTO {
    private Long id;
    
    @NotBlank(message = "Resource name is required")
    private String name;
    
    private String description;
    
    @NotNull(message = "Resource type is required")
    private ResourceType type;
    
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;
    
    @NotBlank(message = "Location is required")
    private String location;
    
    private String building;
    private String floor;
    
    @NotNull(message = "Available from time is required")
    private LocalTime availableFrom;
    
    @NotNull(message = "Available to time is required")
    private LocalTime availableTo;
    
    private ResourceStatus status;
    private String imageUrl;
}
