package com.lkl.studygroup.dto.response;

import lombok.Data;
import java.time.LocalDateTime;


@Data
public class UserDirectChatResponse {
    private String chatId;
    private LocalDateTime lastMessageAt;
    private ReceiverInfo receiverInfo;

    public UserDirectChatResponse(String chatId, LocalDateTime lastMessageAt, ReceiverInfo receiverInfo) {
        this.chatId = chatId;
        this.lastMessageAt = lastMessageAt;
        this.receiverInfo = receiverInfo;
    }
}
