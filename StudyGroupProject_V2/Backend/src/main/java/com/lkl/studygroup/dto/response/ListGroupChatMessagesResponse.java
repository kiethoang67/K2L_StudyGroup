package com.lkl.studygroup.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class ListGroupChatMessagesResponse {
    List<GroupChatMessageResponse> messages;
    long totalMessages;

    public ListGroupChatMessagesResponse(List<GroupChatMessageResponse> messages, long totalMessages) {
        this.messages = messages;
        this.totalMessages = totalMessages;
    }
}
