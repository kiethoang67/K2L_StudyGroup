package com.lkl.studygroup.dto.request;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class MarkAsRead {
    private List<UUID> notificationIds;
}
