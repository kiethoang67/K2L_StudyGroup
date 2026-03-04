package com.lkl.studygroup.repository.ImpRepoCustom;

import com.lkl.studygroup.model.mongo.Message;
import com.lkl.studygroup.repository.MessageRepositoryCustom;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;

import java.util.List;

@RequiredArgsConstructor
public class MessageRepositoryCustomImpl implements MessageRepositoryCustom {
    private final MongoTemplate mongoTemplate;

    @Override
    public Page<Message> findMessagesByChatId(String chatId, String keyword, Pageable pageable) {
        // Build criteria for chatId
        Criteria criteria = Criteria.where("chatId").is(chatId);
        
        // Add keyword search if provided
        if (keyword != null && !keyword.trim().isEmpty()) {
            criteria = new Criteria().andOperator(
                    criteria,
                    Criteria.where("content").regex(keyword, "i") // case-insensitive search
            );
        }
        
        // Build query with descending sort (newest first)
        Query query = new Query(criteria)
                .with(Sort.by(Sort.Order.desc("createdAt")))
                .with(pageable);
        
        // Get total count and messages
        long total = mongoTemplate.count(Query.of(query).limit(-1).skip(-1), Message.class);
        List<Message> messages = mongoTemplate.find(query, Message.class);
        
        return new PageImpl<>(messages, pageable, total);
    }

    @Override
    public Page<Message> findMessagesByGroupChatId(String groupChatId, String keyword, Pageable pageable) {
        // Build criteria for chatId (groupChatId) and isGroupMessage = true
        Criteria criteria = new Criteria().andOperator(
                Criteria.where("chatId").is(groupChatId),
                Criteria.where("isGroupMessage").is(true)
        );
        
        // Add keyword search if provided
        if (keyword != null && !keyword.trim().isEmpty()) {
            criteria = new Criteria().andOperator(
                    criteria,
                    Criteria.where("content").regex(keyword, "i") // case-insensitive search
            );
        }
        
        // Build query with descending sort (newest first)
        Query query = new Query(criteria)
                .with(Sort.by(Sort.Order.desc("createdAt")))
                .with(pageable);
        
        // Get total count and messages
        long total = mongoTemplate.count(Query.of(query).limit(-1).skip(-1), Message.class);
        List<Message> messages = mongoTemplate.find(query, Message.class);
        
        return new PageImpl<>(messages, pageable, total);
    }
}
