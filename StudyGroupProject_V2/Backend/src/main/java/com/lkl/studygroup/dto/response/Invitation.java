package com.lkl.studygroup.dto.response;

import lombok.Data;

@Data
public class Invitation {
    private String groupId;
    private String groupName;

    public Invitation(String groupId, String groupName) {
        this.groupId = groupId;
        this.groupName = groupName;
    }
}
