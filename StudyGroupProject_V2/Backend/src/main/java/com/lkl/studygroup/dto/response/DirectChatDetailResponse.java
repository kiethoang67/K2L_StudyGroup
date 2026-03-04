package com.lkl.studygroup.dto.response;

import com.lkl.studygroup.model.enums.GroupRole;
import lombok.Data;

import java.util.UUID;

@Data
public class DirectChatDetailResponse {
    String userId;
    String firstName;
    String lastName;
    String email;
    String avatar;
    public DirectChatDetailResponse(String userId, String firstName, String lastName, String email, String avatar) {
        this.userId = userId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.avatar = avatar;
    }
}
