package com.lkl.studygroup.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class ListNotificationWithTotalResponse {
    private List<NotificationResponse> notificationResponseList;
    private long total;

    public ListNotificationWithTotalResponse(List<NotificationResponse> notificationResponseList, long total) {
        this.notificationResponseList = notificationResponseList;
        this.total = total;
    }
}
