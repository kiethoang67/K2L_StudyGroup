package com.lkl.studygroup.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class GroupChatMessageResponse {
    private String content;
    private LocalDateTime messageAt;
    private String messageType;
    private SenderInfo senderInfo;

    public GroupChatMessageResponse(String content, LocalDateTime messageAt, String messageType, SenderInfo senderInfo) {
        this.content = content;
        this.messageAt = messageAt;
        this.messageType = messageType;
        this.senderInfo = senderInfo;
    }
}
