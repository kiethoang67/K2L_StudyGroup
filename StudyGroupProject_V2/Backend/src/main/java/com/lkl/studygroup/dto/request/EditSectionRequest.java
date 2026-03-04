package com.lkl.studygroup.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class EditSectionRequest {
    private String content;
    private List<String> attachments;

    public EditSectionRequest(List<String> attachments, String content) {
        this.attachments = attachments;
        this.content = content;
    }
}
