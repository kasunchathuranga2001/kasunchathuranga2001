package com.smartcampus.repository;

import com.smartcampus.entity.Notification;
import com.smartcampus.entity.User;
import com.smartcampus.enums.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    List<Notification> findByUserAndReadFalseOrderByCreatedAtDesc(User user);
    List<Notification> findByType(NotificationType type);
    long countByUserAndReadFalse(User user);
}
