package com.lkl.studygroup.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class CreateSectionRequest {
    private String content;
    private List<String> attachments;

    public CreateSectionRequest(String content, List<String> attachments) {
        this.content = content;
        this.attachments = attachments;
    }
}
