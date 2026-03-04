package com.lkl.studygroup.dto.response;

import lombok.Data;
@Data
public class GroupChatMessagesResponse {
    private String id;
    private String groupId;
    private String fileUrl;
    private String sender;
    private String content;
    public GroupChatMessagesResponse(String id, String content, String sender, String fileUrl, String groupId) {
        this.id = id;
        this.content = content;
        this.sender = sender;
        this.fileUrl = fileUrl;
        this.groupId = groupId;
    }
}
