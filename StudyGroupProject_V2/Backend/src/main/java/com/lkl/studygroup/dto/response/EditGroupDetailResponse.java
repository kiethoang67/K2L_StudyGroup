package com.lkl.studygroup.dto.response;

import com.lkl.studygroup.model.Group;
import lombok.Data;

import java.util.List;
@Data
public class EditGroupDetailResponse {
    private String name;
    private String description;
    private Boolean isPublic;
    private String bannerUrl;
    private List<String> tags;

    public EditGroupDetailResponse(Group group) {
        this.name = group.getName();
        this.description = group.getDescription();
        this.isPublic = group.getIsPublic();
        this.bannerUrl = group.getBannerUrl();
        this.tags = group.getTags();
    }
}
