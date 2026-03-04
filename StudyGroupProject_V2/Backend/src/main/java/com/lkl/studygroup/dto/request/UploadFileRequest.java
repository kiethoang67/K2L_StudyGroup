package com.lkl.studygroup.dto.request;

import lombok.Data;

@Data
public class UploadFileRequest {
    private String fileName;
    private String contentType;

    public UploadFileRequest(String fileName, String contentType) {
        this.fileName = fileName;
        this.contentType = contentType;
    }
}
