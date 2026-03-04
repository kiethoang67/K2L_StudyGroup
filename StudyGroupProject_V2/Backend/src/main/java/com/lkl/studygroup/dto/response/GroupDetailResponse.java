package com.lkl.studygroup.dto.response;

import com.lkl.studygroup.model.Group;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
@Getter
@Setter
public class GroupDetailResponse {
    private UUID id;
    private String name;
    private String description;
    private Boolean isPublic;
    private String bannerUrl;
    private List<String> tags;
    private String createdByUser;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public GroupDetailResponse(Group group, String createdByUser) {
        this.id = group.getId();
        this.name = group.getName();
        this.description = group.getDescription();
        this.isPublic = group.getIsPublic();
        this.bannerUrl = group.getBannerUrl();
        this.tags = group.getTags();
        this.createdByUser = createdByUser;
        this.createdAt = group.getCreatedAt();
        this.updatedAt = group.getUpdatedAt();
    }
}
