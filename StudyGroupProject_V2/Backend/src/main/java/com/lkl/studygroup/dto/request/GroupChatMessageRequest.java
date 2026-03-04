package com.lkl.studygroup.dto.request;

import lombok.Data;

import java.time.Instant;
@Data
public class GroupChatMessageRequest {
    //private String fileUrl;
    private String messageType;
    private String content;

}
