package com.smartcampus.service;

import com.smartcampus.dto.TicketDTO;
import com.smartcampus.entity.Resource;
import com.smartcampus.entity.Ticket;
import com.smartcampus.entity.User;
import com.smartcampus.enums.TicketCategory;
import com.smartcampus.enums.TicketPriority;
import com.smartcampus.enums.TicketStatus;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for managing maintenance and incident tickets
 * Module C - Maintenance & Incident Ticketing
 */
@Service
@RequiredArgsConstructor
@Transactional
public class TicketService {

    private final TicketRepository ticketRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    private final String uploadDir = "./uploads/tickets";

    public List<TicketDTO> getAllTickets() {
        return ticketRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public TicketDTO getTicketById(Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));
        return convertToDTO(ticket);
    }

    public List<TicketDTO> getUserTickets(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return ticketRepository.findByCreatedBy(user).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<TicketDTO> getAssignedTickets(Long technicianId) {
        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found with id: " + technicianId));
        return ticketRepository.findByAssignedTo(technician).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public TicketDTO createTicket(TicketDTO dto, Long userId, List<MultipartFile> attachments) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Resource resource = null;
        if (dto.getResourceId() != null) {
            resource = resourceRepository.findById(dto.getResourceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + dto.getResourceId()));
        }

        List<String> attachmentPaths = new ArrayList<>();
        if (attachments != null && !attachments.isEmpty()) {
            if (attachments.size() > 3) {
                throw new IllegalArgumentException("Maximum 3 attachments allowed");
            }
            attachmentPaths = saveAttachments(attachments);
        }

        Ticket ticket = Ticket.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .category(dto.getCategory())
                .priority(dto.getPriority())
                .status(TicketStatus.OPEN)
                .resource(resource)
                .location(dto.getLocation())
                .createdBy(user)
                .contactEmail(dto.getContactEmail())
                .contactPhone(dto.getContactPhone())
                .attachments(attachmentPaths)
                .build();

        ticket = ticketRepository.save(ticket);
        return convertToDTO(ticket);
    }

    public TicketDTO assignTicket(Long ticketId, Long technicianId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));
        
        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found with id: " + technicianId));

        ticket.setAssignedTo(technician);
        ticket.setStatus(TicketStatus.IN_PROGRESS);
        
        ticket = ticketRepository.save(ticket);
        
        // Send notification
        notificationService.createTicketAssignmentNotification(ticket);
        
        return convertToDTO(ticket);
    }

    public TicketDTO updateTicketStatus(Long id, TicketStatus status, String notes) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));

        ticket.setStatus(status);
        
        if (status == TicketStatus.RESOLVED) {
            ticket.setResolutionNotes(notes);
            ticket.setResolvedAt(LocalDateTime.now());
        } else if (status == TicketStatus.CLOSED) {
            ticket.setClosedAt(LocalDateTime.now());
        } else if (status == TicketStatus.REJECTED) {
            ticket.setRejectionReason(notes);
        }

        ticket = ticketRepository.save(ticket);
        
        // Send notification
        notificationService.createTicketStatusChangeNotification(ticket);
        
        return convertToDTO(ticket);
    }

    public void deleteTicket(Long id) {
        if (!ticketRepository.existsById(id)) {
            throw new ResourceNotFoundException("Ticket not found with id: " + id);
        }
        ticketRepository.deleteById(id);
    }

    public List<TicketDTO> filterTickets(TicketStatus status, TicketPriority priority, 
                                          TicketCategory category, Long assignedToId) {
        return ticketRepository.filterTickets(status, priority, category, assignedToId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private List<String> saveAttachments(List<MultipartFile> files) {
        List<String> paths = new ArrayList<>();
        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            for (MultipartFile file : files) {
                String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
                Path filePath = uploadPath.resolve(filename);
                Files.copy(file.getInputStream(), filePath);
                paths.add(filePath.toString());
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to save attachments", e);
        }
        return paths;
    }

    private TicketDTO convertToDTO(Ticket ticket) {
        return TicketDTO.builder()
                .id(ticket.getId())
                .title(ticket.getTitle())
                .description(ticket.getDescription())
                .category(ticket.getCategory())
                .priority(ticket.getPriority())
                .status(ticket.getStatus())
                .resourceId(ticket.getResource() != null ? ticket.getResource().getId() : null)
                .resourceName(ticket.getResource() != null ? ticket.getResource().getName() : null)
                .location(ticket.getLocation())
                .createdById(ticket.getCreatedBy().getId())
                .createdByName(ticket.getCreatedBy().getName())
                .assignedToId(ticket.getAssignedTo() != null ? ticket.getAssignedTo().getId() : null)
                .assignedToName(ticket.getAssignedTo() != null ? ticket.getAssignedTo().getName() : null)
                .contactEmail(ticket.getContactEmail())
                .contactPhone(ticket.getContactPhone())
                .resolutionNotes(ticket.getResolutionNotes())
                .rejectionReason(ticket.getRejectionReason())
                .attachments(ticket.getAttachments())
                .createdAt(ticket.getCreatedAt())
                .resolvedAt(ticket.getResolvedAt())
                .build();
    }
}
