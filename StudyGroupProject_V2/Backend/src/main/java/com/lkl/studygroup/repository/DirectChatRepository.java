package com.lkl.studygroup.repository;


import com.lkl.studygroup.dto.response.DirectChatMessageResponse;
import com.lkl.studygroup.dto.response.GroupChatMessagesResponse;
import com.lkl.studygroup.model.User;
import com.lkl.studygroup.model.mongo.DirectChat;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DirectChatRepository extends MongoRepository<DirectChat, String>, DirectChatRepositoryCustom {
    // Custom query methods (if needed) can be defined here

}