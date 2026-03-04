package com.lkl.studygroup.dto.response;

import com.lkl.studygroup.model.Meeting;
import lombok.Data;

import java.util.List;
@Data
public class ListMeetingWithTotalResponse {
    private List<MeetingResponse> meetings;
    private Long total;

    public ListMeetingWithTotalResponse(List<MeetingResponse> meetings, Long total) {
        this.meetings = meetings;
        this.total = total;
    }
}
