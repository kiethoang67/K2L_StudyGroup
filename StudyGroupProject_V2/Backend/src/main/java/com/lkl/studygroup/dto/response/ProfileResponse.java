package com.lkl.studygroup.dto.response;


import lombok.Getter;
@Getter
public class ProfileResponse {
    private UserProfileDto user;
    public ProfileResponse(UserProfileDto user) {
        this.user = user;
    }
}
