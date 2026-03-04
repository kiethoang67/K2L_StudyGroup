package com.lkl.studygroup.repository;


import com.lkl.studygroup.dto.response.GroupChatMessagesResponse;
import com.lkl.studygroup.model.mongo.GroupChat;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

public interface GroupChatRepository extends MongoRepository<GroupChat, String> {

    @Query(
            value = "{ groupId: ?0 }",
            sort = "{ createdAt: -1 }"
    )
    public List<GroupChatMessagesResponse> getAllMessageByGroupId (String groupId);
    @Query(
            value = "{ groupId: ?0 }"
    )
    public java.util.Optional<GroupChat> findByGroupId (String groupId);
}
