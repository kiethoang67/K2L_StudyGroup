package com.lkl.studygroup.model.enums;

import lombok.Getter;

@Getter
public enum NotificationType {
    NEW_SECTION ("New Section is posted in group"),
    NEW_MEETING ("New Meeting is created in group");

    private final String message;

    NotificationType(String message) {
        this.message = message;
    }

}
