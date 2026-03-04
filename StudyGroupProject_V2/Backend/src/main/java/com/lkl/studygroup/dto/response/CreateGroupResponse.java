package com.lkl.studygroup.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;
@Getter
@Setter
public class CreateGroupResponse {
    private String groupName;
    private UUID groupId;
    public CreateGroupResponse(String groupName, UUID groupId) {
        this.groupName = groupName;
        this.groupId = groupId;
    }
}
