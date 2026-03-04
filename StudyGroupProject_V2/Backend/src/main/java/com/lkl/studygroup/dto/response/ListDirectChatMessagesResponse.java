package com.lkl.studygroup.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class ListDirectChatMessagesResponse {
    List<DirectChatMessageResponse> directChatMessages;
    long total;

    public ListDirectChatMessagesResponse(List<DirectChatMessageResponse> directChatMessages, long total) {
        this.directChatMessages = directChatMessages;
        this.total = total;
    }
}
