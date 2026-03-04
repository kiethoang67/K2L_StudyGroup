package com.lkl.studygroup.dto.request;
import lombok.*;

import java.util.List;

@Getter
@Setter
public class CreateGroupRequest {
    private String name;
    private String description;
    private Boolean isPublic;
    private List<String> tags;
}
