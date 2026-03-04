package com.lkl.studygroup.dto.request;

import lombok.Data;

@Data
public class ForgotPasswordChangeRequest {
    private String email;
    private String code;
    private String newPassword;
    private String confirmNewPassword;
}
