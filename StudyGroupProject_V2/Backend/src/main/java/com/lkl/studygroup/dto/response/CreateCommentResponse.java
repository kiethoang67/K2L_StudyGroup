package com.lkl.studygroup.dto.response;

import lombok.Data;

@Data
public class CreateCommentResponse {
    private String commentId;
    private String content;
    private CreatorInfo creatorInfo;

    public CreateCommentResponse(String commentId, String content, CreatorInfo creatorInfo) {
        this.commentId = commentId;
        this.content = content;
        this.creatorInfo = creatorInfo;
    }
}
