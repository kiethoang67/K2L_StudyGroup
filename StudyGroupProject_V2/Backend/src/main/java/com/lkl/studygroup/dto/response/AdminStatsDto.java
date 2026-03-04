package com.lkl.studygroup.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminStatsDto {
    private long totalUsers;
    private long totalGroups;
    private long totalResources;
    private long totalMeetings;
}
