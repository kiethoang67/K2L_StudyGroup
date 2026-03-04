package com.lkl.studygroup.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class UserUpdateRequest {
    private String firstName;
    private String lastName;
    private String avatarUrl;
    private List<String> interests;
}
