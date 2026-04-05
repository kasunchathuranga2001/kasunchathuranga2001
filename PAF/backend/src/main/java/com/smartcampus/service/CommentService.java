package com.smartcampus.service;

import com.smartcampus.dto.CommentDTO;
import com.smartcampus.entity.Comment;
import com.smartcampus.entity.Ticket;
import com.smartcampus.entity.User;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.exception.UnauthorizedAccessException;
import com.smartcampus.repository.CommentRepository;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing ticket comments
 * Part of Module C - Maintenance & Incident Ticketing
 */
@Service
@RequiredArgsConstructor
@Transactional
public class CommentService {

    private final CommentRepository commentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public List<CommentDTO> getCommentsByTicket(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));
        return commentRepository.findByTicketOrderByCreatedAtDesc(ticket).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public CommentDTO addComment(Long ticketId, CommentDTO dto, Long userId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));
        
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Comment comment = Comment.builder()
                .content(dto.getContent())
                .ticket(ticket)
                .author(author)
                .build();

        comment = commentRepository.save(comment);
        
        // Send notification to ticket creator if commenter is different
        if (!ticket.getCreatedBy().getId().equals(userId)) {
            notificationService.createNewCommentNotification(comment);
        }
        
        return convertToDTO(comment);
    }

    public CommentDTO updateComment(Long commentId, CommentDTO dto, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));
        
        if (!comment.getAuthor().getId().equals(userId)) {
            throw new UnauthorizedAccessException("You can only edit your own comments");
        }

        comment.setContent(dto.getContent());
        comment = commentRepository.save(comment);
        
        return convertToDTO(comment);
    }

    public void deleteComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));
        
        if (!comment.getAuthor().getId().equals(userId)) {
            throw new UnauthorizedAccessException("You can only delete your own comments");
        }

        commentRepository.delete(comment);
    }

    private CommentDTO convertToDTO(Comment comment) {
        return CommentDTO.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .ticketId(comment.getTicket().getId())
                .authorId(comment.getAuthor().getId())
                .authorName(comment.getAuthor().getName())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }
}
