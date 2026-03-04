package com.lkl.studygroup.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateMeetingRequest {
    private String title;
    private String description;
    @JsonFormat(pattern = "yyyy-MM-dd hh:mm a")
    private LocalDateTime startedAt;
    @JsonFormat(pattern = "yyyy-MM-dd hh:mm a")
    private LocalDateTime endedAt;

}
