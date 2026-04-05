package com.smartcampus.repository;

import com.smartcampus.entity.Ticket;
import com.smartcampus.entity.User;
import com.smartcampus.enums.TicketCategory;
import com.smartcampus.enums.TicketPriority;
import com.smartcampus.enums.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByCreatedBy(User user);
    List<Ticket> findByAssignedTo(User technician);
    List<Ticket> findByStatus(TicketStatus status);
    List<Ticket> findByPriority(TicketPriority priority);
    List<Ticket> findByCategory(TicketCategory category);
    
    @Query("SELECT t FROM Ticket t WHERE " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:priority IS NULL OR t.priority = :priority) AND " +
           "(:category IS NULL OR t.category = :category) AND " +
           "(:assignedToId IS NULL OR t.assignedTo.id = :assignedToId)")
    List<Ticket> filterTickets(
            @Param("status") TicketStatus status,
            @Param("priority") TicketPriority priority,
            @Param("category") TicketCategory category,
            @Param("assignedToId") Long assignedToId);
    
    List<Ticket> findByStatusIn(List<TicketStatus> statuses);
}
