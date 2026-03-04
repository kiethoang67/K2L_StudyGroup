package com.lkl.studygroup.dto.response;

import lombok.Data;

@Data
public class ReceiverInfo {
    private String id;
    private String email;
    private String firstName;
    private String lastName;
    private String avatarUrl;

    public ReceiverInfo(String id,String email, String avatarUrl, String lastName, String firstName) {
        this.id = id;
        this.email = email;
        this.avatarUrl = avatarUrl;
        this.lastName = lastName;
        this.firstName = firstName;
    }
}
