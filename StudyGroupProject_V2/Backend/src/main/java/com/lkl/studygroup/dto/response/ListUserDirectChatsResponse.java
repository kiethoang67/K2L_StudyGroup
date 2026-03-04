package com.lkl.studygroup.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class ListUserDirectChatsResponse {
    List<UserDirectChatResponse>  userDirectChats;
    long totalDirectChats;

    public ListUserDirectChatsResponse(List<UserDirectChatResponse> userDirectChats, long totalDirectChats) {
        this.userDirectChats = userDirectChats;
        this.totalDirectChats =  totalDirectChats;
    }
}
