package com.lkl.studygroup.repository;

import com.lkl.studygroup.model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findByUserId(UUID userId, Pageable pageable);
    @Query("select count(n) from Notification n where n.user.id = :userId and n.isRead = :isRead")
    long getTotalNotificationbyUserIdandStatus(@Param("userId") UUID userId, @Param("isRead") boolean isRead);
    @Modifying
    @Query("""
    UPDATE Notification n
    SET n.isRead = true
    WHERE n.user.id = :userId
    AND n.id IN :notificationIds
    """)
    int markAsRead(
            @Param("userId") UUID userId,
            @Param("notificationIds") List<UUID> notificationIds
    );
    @Modifying
    @Query("""
    UPDATE Notification n
    SET n.isRead = true
    WHERE n.user.id = :userId
    AND n.isRead = false
    """)
    int markAllAsRead(@Param("userId") UUID userId);

}
