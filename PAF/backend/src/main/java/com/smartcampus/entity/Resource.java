package com.smartcampus.entity;

import com.smartcampus.enums.ResourceStatus;
import com.smartcampus.enums.ResourceType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Resource entity for facilities and assets catalogue
 * Module A - Facilities & Assets Catalogue
 */
@Entity
@Table(name = "resources")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResourceType type;

    private Integer capacity;

    @Column(nullable = false)
    private String location;

    private String building;

    private String floor;

    @Column(nullable = false)
    private LocalTime availableFrom;

    @Column(nullable = false)
    private LocalTime availableTo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResourceStatus status;

    private String imageUrl;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "resource", cascade = CascadeType.ALL)
    private List<Booking> bookings = new ArrayList<>();

    @OneToMany(mappedBy = "resource", cascade = CascadeType.ALL)
    private List<Ticket> tickets = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = ResourceStatus.ACTIVE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
