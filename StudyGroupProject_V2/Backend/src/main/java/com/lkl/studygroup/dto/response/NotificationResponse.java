package com.lkl.studygroup.dto.response;

import com.lkl.studygroup.model.enums.NotificationType;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.NoArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
public class NotificationResponse {
    private UUID id;
    private String message;
    private NotificationType notificationType;
    @JsonProperty("isRead")
    private boolean isRead;
    private LocalDateTime createdAt;

    public NotificationResponse(UUID id, String message, NotificationType notificationType, boolean isRead, LocalDateTime createdAt) {
        this.id = id;
        this.message = message;
        this.notificationType = notificationType;
        this.isRead = isRead;
        this.createdAt = createdAt;
    }
}
