package com.lkl.studygroup.dto.response;

import lombok.Data;

@Data
public class ListCommentsResponse {
    private String commentId;
    private String content;
    private CreatorInfo creatorInfo;

    public ListCommentsResponse(String commentId, String content, CreatorInfo creatorInfo) {
        this.commentId = commentId;
        this.content = content;
        this.creatorInfo = creatorInfo;
    }
}
