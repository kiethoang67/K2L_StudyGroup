package com.lkl.studygroup.dto.response;

import lombok.Getter;

@Getter
public class LoginResponse {
    private String token;
    private UserProfileDto user;

    public LoginResponse(String token, UserProfileDto user) {
        this.token = token;
        this.user = user;
    }
}