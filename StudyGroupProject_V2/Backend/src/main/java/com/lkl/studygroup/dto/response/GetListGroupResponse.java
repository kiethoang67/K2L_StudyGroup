package com.lkl.studygroup.dto.response;

import com.lkl.studygroup.model.enums.GroupRole;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class GetListGroupResponse {
    UUID groupId;
    String groupName;
    GroupRole groupRole;
    List<String> tags;
    String description;
    Boolean isPublic;

    public GetListGroupResponse(UUID groupId, String groupName, GroupRole groupRole) {
        this.groupId = groupId;
        this.groupName = groupName;
        this.groupRole = groupRole;
    }

    public GetListGroupResponse(UUID groupId, String groupName, GroupRole groupRole, List<String> tags,
            String description, Boolean isPublic) {
        this.groupId = groupId;
        this.groupName = groupName;
        this.groupRole = groupRole;
        this.tags = tags;
        this.description = description;
        this.isPublic = isPublic;
    }
}
