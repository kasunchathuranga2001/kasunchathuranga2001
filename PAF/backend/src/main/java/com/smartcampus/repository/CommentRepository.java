package com.smartcampus.repository;

import com.smartcampus.entity.Comment;
import com.smartcampus.entity.Ticket;
import com.smartcampus.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByTicket(Ticket ticket);
    List<Comment> findByAuthor(User author);
    List<Comment> findByTicketOrderByCreatedAtDesc(Ticket ticket);
}
