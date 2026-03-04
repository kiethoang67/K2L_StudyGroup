package com.lkl.studygroup.repository;

import com.lkl.studygroup.model.mongo.DirectChat;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface DirectChatRepositoryCustom {
    public Page<DirectChat> findDirectChatsBySenderId (String senderId, Pageable pageable, List<String> matchedUserIds, boolean isSearched);
    public Optional<DirectChat> findByParticipantIdsContainingAll(List<String> participantIds);
}
