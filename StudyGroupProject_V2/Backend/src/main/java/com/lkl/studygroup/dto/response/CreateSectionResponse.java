package com.lkl.studygroup.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class CreateSectionResponse {
    private String sectionId;
    private String content;
    private List<String> attachments;
    private CreatorInfo creatorInfo;

    public CreateSectionResponse(String sectionId, List<String> attachments, String content, CreatorInfo creatorInfo) {
        this.sectionId = sectionId;
        this.attachments = attachments;
        this.content = content;
        this.creatorInfo = creatorInfo;
    }
}
