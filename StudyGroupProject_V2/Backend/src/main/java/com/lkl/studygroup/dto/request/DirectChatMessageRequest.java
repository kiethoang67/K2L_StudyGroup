package com.lkl.studygroup.dto.request;

import lombok.Data;

@Data
public class DirectChatMessageRequest {
    private String content;
    private String receiverId;
    private String messageType;
}
