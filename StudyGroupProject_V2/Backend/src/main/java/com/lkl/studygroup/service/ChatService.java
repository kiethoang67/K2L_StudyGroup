package com.lkl.studygroup.service;


import com.lkl.studygroup.dto.request.DirectChatMessageRequest;
import com.lkl.studygroup.dto.request.GroupChatMessageRequest;
import com.lkl.studygroup.dto.response.*;
import com.lkl.studygroup.enums.ErrorCode;
import com.lkl.studygroup.exception.ExceptionResponse;
import com.lkl.studygroup.model.User;
import com.lkl.studygroup.model.mongo.DirectChat;
import com.lkl.studygroup.model.mongo.GroupChat;
import com.lkl.studygroup.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import com.lkl.studygroup.model.mongo.Message;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class ChatService {
    private final SimpMessagingTemplate messagingTemplate;
    @Autowired
    private GroupChatRepository groupChatRepository;
    @Autowired
    private DirectChatRepository directChatRepository;
    @Autowired
    private MessageRepository messageRepository;
    @Autowired
    private GroupMemberRepository groupMemberRepository;
    @Autowired
    private UserRepository userRepository;


    // Helper method to get or create GroupChat ID
    private String getOrCreateGroupChatId(String groupId) {
        return groupChatRepository.findByGroupId(groupId)
                .map(GroupChat::getId)
                .orElseGet(() -> {
                    // Lazy create if not exists
                    GroupChat newChat = new GroupChat(groupId);
                    groupChatRepository.save(newChat);
                    return newChat.getId();
                });
    }

    public ListGroupChatMessagesResponse getGroupChatMessages(String groupId, String keyword, Integer pageNumber, Integer pageSize) {
        // Get or create groupChatId
        String groupChatId = getOrCreateGroupChatId(groupId);
        
        // Query messages with pagination
        Pageable pageDetails = PageRequest.of(pageNumber - 1, pageSize);
        Page<Message> result = messageRepository.findMessagesByGroupChatId(groupChatId, keyword, pageDetails);
        
        // Get unique sender IDs
        List<String> senderIds = result.getContent().stream()
                .map(Message::getSenderId)
                .distinct()
                .collect(Collectors.toList());
        
        // Fetch all sender user info
        List<User> senders = userRepository.findUsersByIds(senderIds);
        
        // Create sender info map for quick lookup
        Map<String, SenderInfo> senderInfoMap = new HashMap<>();
        for (User user : senders) {
            senderInfoMap.put(
                    user.getId().toString(),
                    new SenderInfo(
                            user.getId().toString(),
                            user.getEmail(),
                            user.getFirstName(),
                            user.getLastName(),
                            user.getAvatarUrl()
                    )
            );
        }
        
        // Map messages to response with sender info
        List<GroupChatMessageResponse> messages = result.getContent().stream()
                .map(message -> new GroupChatMessageResponse(
                        message.getContent(),
                        message.getCreatedAt().atZone(ZoneId.systemDefault()).toLocalDateTime(),
                        message.getMessageType(),
                        senderInfoMap.get(message.getSenderId())
                ))
                .collect(Collectors.toList());
        
        return new ListGroupChatMessagesResponse(messages, result.getTotalElements());
    }

    public void sendGroupChatMessages (String groupId, GroupChatMessageRequest groupChatMessageRequest, String userId){
        String groupChatId = getOrCreateGroupChatId(groupId);
        Message message = new Message();
        message.setChatId(groupChatId);
        message.setContent(groupChatMessageRequest.getContent());
        message.setSenderId(userId);
        message.setGroupMessage(true);
        message.setMessageType(groupChatMessageRequest.getMessageType());
        messageRepository.save(message);
        
        try {
            List<String> listGroupMemberId = groupMemberRepository.findUserIdsByGroupId(UUID.fromString(groupId));
            
            // Create a payload that includes the groupId for frontend filtering
            java.util.Map<String, Object> payload = new java.util.HashMap<>();
            payload.put("id", message.getId());
            payload.put("content", message.getContent());
            payload.put("senderId", message.getSenderId());
            payload.put("createdAt", message.getCreatedAt());
            payload.put("chatId", message.getChatId());
            payload.put("messageType", message.getMessageType());
            payload.put("groupId", groupId); // Crucial for filtering

            for (String memberId : listGroupMemberId){
                messagingTemplate.convertAndSendToUser(
                        memberId,
                        "/chat",
                        payload
                );
            }
        } catch (IllegalArgumentException e) {
            System.err.println("Invalid UUID format for groupId: " + groupId);
            // Log error but allow message to be saved
        }
    }
    public DirectChat newDirectChat (String userId1, String userId2){
        // Check if chat already exists between these two users
        List<String> listParticipantIds = new ArrayList<>();
        listParticipantIds.add(userId1);
        listParticipantIds.add(userId2);
        
        Optional<DirectChat> existingChat = directChatRepository.findByParticipantIdsContainingAll(listParticipantIds);
        if (existingChat.isPresent()) {
            throw new ExceptionResponse(ErrorCode.DIRECT_CHAT_ALREADY_EXISTS);
        }
        
        // Create new chat if not exists
        DirectChat directChat = new DirectChat();
        directChat.setLastMessageAt(java.time.Instant.now());
        directChat.setParticipantIds(listParticipantIds);
        directChatRepository.save(directChat);
        return directChat;
    }

    public void sendDirectChatMessages (String userId,String chatId, DirectChatMessageRequest directChatMessageRequest){
        Message message = new Message();
        message.setChatId(chatId);
        message.setContent(directChatMessageRequest.getContent());
        message.setSenderId(userId);
        message.setMessageType(directChatMessageRequest.getMessageType());
        message.setReceiverId(directChatMessageRequest.getReceiverId());
        messageRepository.save(message);
        
        // Update lastMessageAt for the DirectChat
        DirectChat directChat = directChatRepository.findById(chatId)
                .orElseThrow(() -> new ExceptionResponse(ErrorCode.DIRECT_CHAT_NOT_FOUND));
        directChat.setLastMessageAt(java.time.Instant.now());
        directChatRepository.save(directChat);
        
//        messagingTemplate.convertAndSendToUser(
//                message.getReceiverId(),
//                "/chat",
//                message
//        );
        System.out.println("dfsdfsdfsdsdfsd"+message.getReceiverId());
        messagingTemplate.convertAndSend(
                "/user/"+message.getReceiverId()+"/chat",
                message
        );
        System.out.println("hai"+message.getReceiverId());
    }

    public List<DirectChatDetailResponse> getDirectChatDetailByDirectChatId (String directChatId){
        DirectChat directChat = directChatRepository
                .findById(directChatId)
                .orElseThrow(() -> new ExceptionResponse(ErrorCode.DIRECT_CHAT_NOT_FOUND));
        List<DirectChatDetailResponse> directChatDetailResponses = new ArrayList<>();
        for(String userId :directChat.getParticipantIds()){
            User user = userRepository.findUserById(userId);
            DirectChatDetailResponse directChatDetailResponse = new DirectChatDetailResponse(userId, user.getFirstName()
                                                                                                ,user.getLastName(), user.getEmail(),
                                                                                                user.getAvatarUrl());
            directChatDetailResponses.add(directChatDetailResponse);
        }
        return directChatDetailResponses;
    }
    


    public ListUserDirectChatsResponse getListUserDirectChatsResponse (String userId, String keyword, Integer pageNumber, Integer pageSize) {
        System.out.println("=== getListUserDirectChatsResponse DEBUG ===");
        System.out.println("UserId: " + userId);
        System.out.println("Keyword: " + keyword);
        System.out.println("Page: " + pageNumber + ", Size: " + pageSize);
        
        List<String> listUserIds = new ArrayList<>();
        boolean isSearched = false;
        if (keyword != null && !keyword.isEmpty()) {
            List<User> listUsers = userRepository.searchUsers(keyword);
            for (User user : listUsers) {
                String userIds = user.getId().toString();
                listUserIds.add(userIds);
            }
            isSearched = true;
        }
        Pageable pageDetails = PageRequest.of(pageNumber - 1, pageSize);
        Page<DirectChat> result = directChatRepository.findDirectChatsBySenderId(userId, pageDetails, listUserIds, isSearched);
        
        System.out.println("Found " + result.getTotalElements() + " chats");
        System.out.println("Chats in this page: " + result.getContent().size());
        for (DirectChat chat : result.getContent()) {
            System.out.println("  - ChatId: " + chat.getId() + ", Participants: " + chat.getParticipantIds());
        }
        
        List<String> receiverIds = result.getContent().stream().map(
                chat -> chat.getParticipantIds().stream().filter(id -> !id.equals(userId)).findFirst().orElse(null)
        ).filter(Objects::nonNull).toList();
        List<User> receivers = userRepository.findUsersByIds(receiverIds); // đã có list user
        // mapping return user
        Map<String, ReceiverInfo> listReceiversInfo = new HashMap<>();
        for (User user : receivers) {
            listReceiversInfo.put(user.getId().toString(), new ReceiverInfo(user.getId().toString(), user.getEmail(), user.getAvatarUrl(), user.getLastName(), user.getFirstName()));
        }
        List<UserDirectChatResponse> userDirectChats = new ArrayList<>();
        for (DirectChat directChat : result.getContent()) {
            String receiverId = directChat.getParticipantIds().stream()
                    .filter(id -> !id.equals(userId))
                    .findFirst()
                    .orElse(null);
            ReceiverInfo receiver = listReceiversInfo.get(receiverId);
            
            // Handle null lastMessageAt - use createdAt or current time as fallback
            java.time.Instant lastMessageTime = directChat.getLastMessageAt();
            if (lastMessageTime == null) {
                lastMessageTime = directChat.getCreatedAt() != null 
                    ? directChat.getCreatedAt() 
                    : java.time.Instant.now();
            }
            
            userDirectChats.add(new UserDirectChatResponse(
                    directChat.getId(),
                    lastMessageTime.atZone(ZoneId.systemDefault()).toLocalDateTime(),
                    receiver
            ));
        }
        
        System.out.println("Returning " + userDirectChats.size() + " formatted chats");
        System.out.println("=== END DEBUG ===");
        
        return new ListUserDirectChatsResponse(userDirectChats, result.getTotalElements());
    }

    public ListDirectChatMessagesResponse getDirectChatMessages(String chatId, String keyword, Integer pageNumber, Integer pageSize) {
        Pageable pageDetails = PageRequest.of(pageNumber - 1, pageSize);
        Page<Message> result = messageRepository.findMessagesByChatId(chatId, keyword, pageDetails);
        
        List<DirectChatMessageResponse> messages = result.getContent().stream()
                .map(message -> new DirectChatMessageResponse(
                        message.getCreatedAt().atZone(ZoneId.systemDefault()).toLocalDateTime(),
                        message.getSenderId(),
                        message.getContent(),
                        message.getMessageType()
                ))
                .collect(Collectors.toList());
        
        return new ListDirectChatMessagesResponse(messages, result.getTotalElements());
    }
    // delete chat
}
