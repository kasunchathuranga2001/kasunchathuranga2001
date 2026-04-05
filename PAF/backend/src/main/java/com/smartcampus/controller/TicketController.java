package com.smartcampus.controller;

import com.smartcampus.dto.ApiResponse;
import com.smartcampus.dto.CommentDTO;
import com.smartcampus.dto.TicketDTO;
import com.smartcampus.enums.TicketCategory;
import com.smartcampus.enums.TicketPriority;
import com.smartcampus.enums.TicketStatus;
import com.smartcampus.service.CommentService;
import com.smartcampus.service.TicketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * REST Controller for Ticket Management
 * Module C - Maintenance & Incident Ticketing
 */
@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@Tag(name = "Tickets", description = "Maintenance & Incident Ticketing APIs")
public class TicketController {

    private final TicketService ticketService;
    private final CommentService commentService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    @Operation(summary = "Get all tickets (Admin/Technician only)")
    public ResponseEntity<ApiResponse<List<TicketDTO>>> getAllTickets() {
        List<TicketDTO> tickets = ticketService.getAllTickets();
        return ResponseEntity.ok(ApiResponse.success(tickets));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get ticket by ID")
    public ResponseEntity<ApiResponse<TicketDTO>> getTicketById(@PathVariable Long id) {
        TicketDTO ticket = ticketService.getTicketById(id);
        return ResponseEntity.ok(ApiResponse.success(ticket));
    }

    @GetMapping("/my-tickets")
    @Operation(summary = "Get current user's tickets")
    public ResponseEntity<ApiResponse<List<TicketDTO>>> getMyTickets(@AuthenticationPrincipal Jwt jwt) {
        Long userId = Long.parseLong(jwt.getSubject());
        List<TicketDTO> tickets = ticketService.getUserTickets(userId);
        return ResponseEntity.ok(ApiResponse.success(tickets));
    }

    @GetMapping("/assigned")
    @PreAuthorize("hasRole('TECHNICIAN')")
    @Operation(summary = "Get tickets assigned to current technician")
    public ResponseEntity<ApiResponse<List<TicketDTO>>> getAssignedTickets(@AuthenticationPrincipal Jwt jwt) {
        Long technicianId = Long.parseLong(jwt.getSubject());
        List<TicketDTO> tickets = ticketService.getAssignedTickets(technicianId);
        return ResponseEntity.ok(ApiResponse.success(tickets));
    }

    @GetMapping("/filter")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    @Operation(summary = "Filter tickets")
    public ResponseEntity<ApiResponse<List<TicketDTO>>> filterTickets(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketPriority priority,
            @RequestParam(required = false) TicketCategory category,
            @RequestParam(required = false) Long assignedToId) {
        List<TicketDTO> tickets = ticketService.filterTickets(status, priority, category, assignedToId);
        return ResponseEntity.ok(ApiResponse.success(tickets));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Create a new ticket with attachments")
    public ResponseEntity<ApiResponse<TicketDTO>> createTicket(
            @Valid @RequestPart("ticket") TicketDTO dto,
            @RequestPart(value = "attachments", required = false) List<MultipartFile> attachments,
            @AuthenticationPrincipal Jwt jwt) {
        Long userId = Long.parseLong(jwt.getSubject());
        TicketDTO ticket = ticketService.createTicket(dto, userId, attachments);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Ticket created successfully", ticket));
    }

    @PatchMapping("/{id}/assign/{technicianId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Assign ticket to technician (Admin only)")
    public ResponseEntity<ApiResponse<TicketDTO>> assignTicket(
            @PathVariable Long id,
            @PathVariable Long technicianId) {
        TicketDTO ticket = ticketService.assignTicket(id, technicianId);
        return ResponseEntity.ok(ApiResponse.success("Ticket assigned", ticket));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    @Operation(summary = "Update ticket status")
    public ResponseEntity<ApiResponse<TicketDTO>> updateTicketStatus(
            @PathVariable Long id,
            @RequestParam TicketStatus status,
            @RequestParam(required = false) String notes) {
        TicketDTO ticket = ticketService.updateTicketStatus(id, status, notes);
        return ResponseEntity.ok(ApiResponse.success("Ticket status updated", ticket));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a ticket (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteTicket(@PathVariable Long id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.ok(ApiResponse.success("Ticket deleted", null));
    }

    // Comment endpoints
    @GetMapping("/{ticketId}/comments")
    @Operation(summary = "Get comments for a ticket")
    public ResponseEntity<ApiResponse<List<CommentDTO>>> getTicketComments(@PathVariable Long ticketId) {
        List<CommentDTO> comments = commentService.getCommentsByTicket(ticketId);
        return ResponseEntity.ok(ApiResponse.success(comments));
    }

    @PostMapping("/{ticketId}/comments")
    @Operation(summary = "Add a comment to a ticket")
    public ResponseEntity<ApiResponse<CommentDTO>> addComment(
            @PathVariable Long ticketId,
            @Valid @RequestBody CommentDTO dto,
            @AuthenticationPrincipal Jwt jwt) {
        Long userId = Long.parseLong(jwt.getSubject());
        CommentDTO comment = commentService.addComment(ticketId, dto, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Comment added", comment));
    }

    @PutMapping("/comments/{commentId}")
    @Operation(summary = "Update a comment")
    public ResponseEntity<ApiResponse<CommentDTO>> updateComment(
            @PathVariable Long commentId,
            @Valid @RequestBody CommentDTO dto,
            @AuthenticationPrincipal Jwt jwt) {
        Long userId = Long.parseLong(jwt.getSubject());
        CommentDTO comment = commentService.updateComment(commentId, dto, userId);
        return ResponseEntity.ok(ApiResponse.success("Comment updated", comment));
    }

    @DeleteMapping("/comments/{commentId}")
    @Operation(summary = "Delete a comment")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @PathVariable Long commentId,
            @AuthenticationPrincipal Jwt jwt) {
        Long userId = Long.parseLong(jwt.getSubject());
        commentService.deleteComment(commentId, userId);
        return ResponseEntity.ok(ApiResponse.success("Comment deleted", null));
    }
}
