package com.lkl.studygroup.dto.response;

import com.lkl.studygroup.model.mongo.Message;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DirectChatMessageResponse {
    private String content;
    private String senderId;
    private LocalDateTime createdAt;
    private String messageType;

    public DirectChatMessageResponse(LocalDateTime createdAt, String senderId, String content, String messageType) {
        this.createdAt = createdAt;
        this.senderId = senderId;
        this.content = content;
        this.messageType = messageType;
    }
}
