package com.lkl.studygroup.repository;

import com.lkl.studygroup.dto.response.GroupChatMessagesResponse;
import org.springframework.data.jpa.repository.Query;

public interface GroupChatRepositoryCustom {
    public GroupChatMessagesResponse getAllMessageByGroupId (String groupId);
}
