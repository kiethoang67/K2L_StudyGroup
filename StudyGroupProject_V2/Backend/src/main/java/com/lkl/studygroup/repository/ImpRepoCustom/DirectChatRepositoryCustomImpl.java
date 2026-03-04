package com.lkl.studygroup.repository.ImpRepoCustom;

import com.lkl.studygroup.model.mongo.DirectChat;
import com.lkl.studygroup.repository.DirectChatRepositoryCustom;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.support.PageableExecutionUtils;

import java.util.List;
import java.util.Optional;
@RequiredArgsConstructor
public class DirectChatRepositoryCustomImpl implements DirectChatRepositoryCustom {
    private final MongoTemplate mongoTemplate;

    @Override
    public Page<DirectChat> findDirectChatsBySenderId(String senderId, Pageable pageable, List<String> matchedUserIds, boolean isSearched) {
       // keyword không match, nên return empty
        if (isSearched && matchedUserIds.isEmpty()) {
            return Page.empty(pageable);
        }
        // FIX: participantIds is an array, need to check if senderId is IN the array
        Criteria criteria = Criteria.where("participantIds").in(senderId);
        if(!matchedUserIds.isEmpty()) {
            criteria = new Criteria().andOperator(
                    criteria,
                    Criteria.where("participantIds").in(matchedUserIds)
            );
        }
        Query query = new Query(criteria) .with(Sort.by( Sort.Order.desc("lastMessageAt"), Sort.Order.desc("createdAt") )) .with(pageable);
        long total = mongoTemplate.count(query, DirectChat.class);
        List<DirectChat> chats = mongoTemplate.find(query, DirectChat.class);
        return new PageImpl<>(chats, pageable, total);
    }

    @Override
    public Optional<DirectChat> findByParticipantIdsContainingAll(List<String> participantIds) {
        Criteria criteria = Criteria.where("participantIds").all(participantIds).size(participantIds.size());
        Query query = new Query(criteria);
        DirectChat chat = mongoTemplate.findOne(query, DirectChat.class);
        return Optional.ofNullable(chat);
    }
}
