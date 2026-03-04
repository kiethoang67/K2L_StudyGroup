package com.lkl.studygroup.dto.response;

import com.lkl.studygroup.model.enums.MeetingStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class MeetingResponse {
    private UUID meetingId;
    private UUID groupId;
    private String title;
    private String description;
    private MeetingStatus meetingStatus;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private String meetingRoomId;
    private CreatorInfo creatorInfo;
    private String groupName;

    public MeetingResponse(UUID meetingId, UUID groupId, String meetingRoomId, String title, String description, MeetingStatus meetingStatus, LocalDateTime startedAt, LocalDateTime endedAt, CreatorInfo creatorInfo, String groupName) {
        this.meetingId = meetingId;
        this.groupId = groupId;
        this.meetingRoomId = meetingRoomId;
        this.title = title;
        this.description = description;
        this.meetingStatus = meetingStatus;
        this.startedAt = startedAt;
        this.endedAt = endedAt;
        this.creatorInfo = creatorInfo;
        this.groupName = groupName;
    }
}
