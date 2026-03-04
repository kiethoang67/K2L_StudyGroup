package com.lkl.studygroup.repository;

import com.lkl.studygroup.model.mongo.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MessageRepositoryCustom {
    Page<Message> findMessagesByChatId(String chatId, String keyword, Pageable pageable);
    Page<Message> findMessagesByGroupChatId(String groupChatId, String keyword, Pageable pageable);
}
