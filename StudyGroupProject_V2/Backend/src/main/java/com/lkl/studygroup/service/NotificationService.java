package com.lkl.studygroup.service;
import com.lkl.studygroup.dto.request.MarkAsRead;
import com.lkl.studygroup.dto.response.*;
import com.lkl.studygroup.model.Notification;
import com.lkl.studygroup.model.User;
import com.lkl.studygroup.model.enums.NotificationType;
import com.lkl.studygroup.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;

@RequiredArgsConstructor
@Service
public class NotificationService {
    private final SimpMessagingTemplate messagingTemplate;
    @Autowired
    private NotificationRepository notificationRepository;
    @Autowired
    private GroupMemberRepository groupMemberRepository;

    public void sendGroupNotification (String groupId, String message, NotificationType notificationType){

        try {
            List<User> members = groupMemberRepository.findUsersByGroupId(UUID.fromString(groupId));
            for(User member : members){
                pushNotificationToUser(member, message, notificationType);
            }
        } catch (Exception e) {
            System.out.println("Send group notification failed");
            // Log error but allow message to be saved
        }
    }

    public void pushNotificationToUser(User user, String message, NotificationType notificationType){
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setNotificationType(notificationType);
        notification.setMessage(message);
        notification.setRead(false);
        notificationRepository.save(notification);

        java.util.Map<String, Object> payload = new java.util.HashMap<>();
        payload.put("id", notification.getId());
        payload.put("notificationType", notification.getNotificationType());
        payload.put("message", notification.getMessage());
        payload.put("createdAt", notification.getCreatedAt());
        payload.put("isRead", notification.isRead());

        messagingTemplate.convertAndSendToUser(
                user.getId().toString(),
                "/notification",
                payload
        );
    }

    public ListNotificationWithTotalResponse getListNotification (UUID userId, Integer pageNumber, Integer pageSize){
        Pageable pageDetails = PageRequest.of(pageNumber - 1, pageSize, Sort.by(Sort.Order.desc("createdAt")).descending());
        Page<Notification> notifications = notificationRepository.findByUserId(userId, pageDetails);
        List<NotificationResponse> notificationResponseList = notifications.stream().map(
                notification -> new NotificationResponse(
                        notification.getId(),
                        notification.getMessage(),
                        notification.getNotificationType(),
                        notification.isRead(),
                        notification.getCreatedAt()
                )
        ).toList();
        ListNotificationWithTotalResponse listNotificationWithTotalResponse = new ListNotificationWithTotalResponse(notificationResponseList,notifications.getTotalElements());
        return listNotificationWithTotalResponse;
    }

    public long getTotalNotificationNotReadYet (UUID userId) {
        long totalNotificationNotReadYet = notificationRepository.getTotalNotificationbyUserIdandStatus(userId,false);
        return totalNotificationNotReadYet;
    }

    @Transactional
    public void markNotificationAsRead(UUID userId, MarkAsRead markAsRead){
        //tránh gây lỗi
        // tránh query vô nghĩa
        if(markAsRead.getNotificationIds().isEmpty()) return;
        notificationRepository.markAsRead(userId, markAsRead.getNotificationIds());
    }

    @Transactional
    public void markAllAsRead(UUID userId) {
        notificationRepository.markAllAsRead(userId);
    }
}
