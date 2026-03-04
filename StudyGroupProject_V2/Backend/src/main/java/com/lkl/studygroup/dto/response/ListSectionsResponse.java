package com.lkl.studygroup.dto.response;

import com.lkl.studygroup.model.Comment;
import lombok.Data;

import java.util.List;
@Data
public class ListSectionsResponse {
    private String sectionId;
    private String content;
    private List<String> attachments;
    private CreatorInfo creatorInfo;
    private List<ListCommentsResponse> comments;
    private long totalComments;

    public ListSectionsResponse(String sectionId, String content, List<String> attachments, List<ListCommentsResponse> comments, long totalComments, CreatorInfo creatorInfo) {
        this.sectionId = sectionId;
        this.content = content;
        this.attachments = attachments;
        this.creatorInfo = creatorInfo;
        this.comments = comments;
        this.totalComments = totalComments;
    }
}
