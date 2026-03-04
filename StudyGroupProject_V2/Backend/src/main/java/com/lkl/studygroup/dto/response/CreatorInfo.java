package com.lkl.studygroup.dto.response;

import lombok.Data;

@Data
public class CreatorInfo {
    private String id;
    private String email;
    private String firstName;
    private String lastName;
    private String avatarUrl;

    public CreatorInfo(String id,String email, String avatarUrl, String lastName, String firstName) {
        this.id = id;
        this.email = email;
        this.avatarUrl = avatarUrl;
        this.lastName = lastName;
        this.firstName = firstName;
    }
}
