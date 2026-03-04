package com.lkl.studygroup.dto.response;

import com.lkl.studygroup.model.Section;
import lombok.Data;

import java.util.List;
@Data
public class EditSectionResponse {
    private String content;
    private List<String> attachments;

    public EditSectionResponse(Section section) {
        this.content = section.getContent();
        this.attachments = section.getAttachments();
    }
}
