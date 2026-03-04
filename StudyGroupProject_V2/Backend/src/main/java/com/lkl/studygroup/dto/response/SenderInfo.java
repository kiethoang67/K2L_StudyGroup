package com.lkl.studygroup.dto.response;

import lombok.Data;

@Data
public class SenderInfo {
    private String senderId;
    private String email;
    private String firstName;
    private String lastName;
    private String avatarUrl;

    public SenderInfo(String senderId, String email, String firstName, String lastName, String avatarUrl) {
        this.senderId = senderId;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.avatarUrl = avatarUrl;
    }
}
