package com.lkl.studygroup.controller;

import com.lkl.studygroup.common.ApiResponse;
import com.lkl.studygroup.dto.request.MarkAsRead;
import com.lkl.studygroup.dto.response.ListNotificationWithTotalResponse;
import com.lkl.studygroup.model.UserPrincipal;
import com.lkl.studygroup.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    @Autowired
    private NotificationService notificationService;

    @GetMapping("")
    public ApiResponse<ListNotificationWithTotalResponse> getAllNotifications(@AuthenticationPrincipal UserPrincipal principal,
                                                                              @RequestParam(name = "pageNumber", defaultValue = "1", required = false) Integer pageNumber,
                                                                              @RequestParam(name = "pageSize", defaultValue = "10", required = false) Integer pageSize){
        return ApiResponse.success(notificationService.getListNotification(principal.getUserId(),pageNumber, pageSize),"success", null);
    }

    @GetMapping("/unread")
    public ApiResponse<Long> getNumberOfUnreadNotifications(@AuthenticationPrincipal UserPrincipal principal){
        Long total = notificationService.getTotalNotificationNotReadYet(principal.getUserId());
        return ApiResponse.success(total,"success", null);
    }

    @PostMapping("/mark")
    public ApiResponse<Void> markNotificationAsRead(@AuthenticationPrincipal UserPrincipal principal, @RequestBody MarkAsRead markAsRead){
        notificationService.markNotificationAsRead(principal.getUserId(),markAsRead);
        return ApiResponse.success(null,"success", null);
    }

    @PostMapping("/mark-all")
    public ApiResponse<Void> markAllNotificationsAsRead(@AuthenticationPrincipal UserPrincipal principal){
        notificationService.markAllAsRead(principal.getUserId());
        return ApiResponse.success(null,"success", null);
    }
}
