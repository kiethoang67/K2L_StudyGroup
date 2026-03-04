package com.lkl.studygroup.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GetListUserWithTotalResponse {
    private List<UserProfileDto> users;
    private long totalUsers;
}
