package com.lkl.studygroup.repository;

import com.lkl.studygroup.model.mongo.Message;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface MessageRepository extends MongoRepository<Message, String>, MessageRepositoryCustom {

    List<Message> findByChatIdOrderByCreatedAtAsc(String chatId);
}
