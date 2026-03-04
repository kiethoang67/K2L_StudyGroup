package com.lkl.studygroup.dto.request;

import lombok.Data;

import java.util.List;
@Data
public class EditGroupDetailRequest {
    private String name;
    private String description;
    private Boolean isPublic;
    private String bannerUrl;
    private List<String> tags;
}
