package com.lkl.studygroup.controller;

import com.lkl.studygroup.common.ApiResponse;
import com.lkl.studygroup.dto.request.DirectChatMessageRequest;
import com.lkl.studygroup.dto.request.GroupChatMessageRequest;
import com.lkl.studygroup.dto.request.NewDirectChatRequest;
import com.lkl.studygroup.dto.response.*;
import com.lkl.studygroup.enums.ErrorCode;
import com.lkl.studygroup.exception.ExceptionResponse;
import com.lkl.studygroup.model.User;
import com.lkl.studygroup.model.UserPrincipal;
import com.lkl.studygroup.model.mongo.DirectChat;
import com.lkl.studygroup.service.ChatService;
import com.lkl.studygroup.service.GroupService;
import com.lkl.studygroup.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
public class ChatController {
    @Autowired
    private ChatService chatService;
    @Autowired
    private GroupService groupService;
    @Autowired
    private UserService userService;


    @GetMapping("/group/{groupId}/messages")
    public ApiResponse<ListGroupChatMessagesResponse> getGroupMessages(
            @PathVariable UUID groupId,
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "pageNumber", defaultValue = "1", required = false) Integer pageNumber,
            @RequestParam(name = "pageSize", defaultValue = "20", required = false) Integer pageSize) {
        ListGroupChatMessagesResponse messages = chatService.getGroupChatMessages(groupId.toString(), keyword, pageNumber, pageSize);
        return ApiResponse.success(messages, "Get Group chat messages Success", null);
    }

    @PostMapping("/group/{groupId}/messages")
    public void sendGroupMessages (@PathVariable UUID groupId, @AuthenticationPrincipal UserPrincipal principal, @RequestBody GroupChatMessageRequest groupChatMessageRequest){
        if(!groupService.findGroupMemberById(groupId,principal.getUserId())){
            throw new ExceptionResponse(ErrorCode.USER_NOT_FOUND);
        }
        chatService.sendGroupChatMessages(groupId.toString(), groupChatMessageRequest, principal.getUserId().toString());
    }

//    @GetMapping("/user/{receiverId}/messages")
//    public ApiResponse<List<DirectChatMessageResponse>> getDirectMessages (@PathVariable String receiverId){
//        List<DirectChatMessageResponse> directChatMessageResponses = chatService.getDirectChatMessages(receiverId);
//        return ApiResponse.success(directChatMessageResponses, "Get Direct chat messages Success", null);
//    }

    @PostMapping("/user/{directChatId}/message")
    public void sendDirectMessages (@AuthenticationPrincipal UserPrincipal principal, @RequestBody DirectChatMessageRequest directChatMessageRequest, @PathVariable String directChatId){
        if(userService.getUserById(directChatMessageRequest.getReceiverId()) == null){
            throw new ExceptionResponse(ErrorCode.USER_NOT_FOUND);
        }
        System.out.println("directChatId: " + directChatId);
        chatService.sendDirectChatMessages(principal.getUserId().toString(),directChatId, directChatMessageRequest);
    }

    @PostMapping("/user/new-direct-chat")
    public ApiResponse<DirectChat> newDirectChat (@RequestBody NewDirectChatRequest newDirectChatRequest, @AuthenticationPrincipal UserPrincipal principal){
        User user = userService.findByEmail(newDirectChatRequest.getEmail());
        if(user == null){
            throw new ExceptionResponse(ErrorCode.USER_NOT_FOUND);
        }
        DirectChat directChat = chatService.newDirectChat(principal.getUserId().toString(), user.getId().toString());
        return ApiResponse.success(directChat, "New Direct Chat Success", null);
    }

    @GetMapping("/user/{directChatId}/detail")
    public ApiResponse<List<DirectChatDetailResponse>>  getDirectChatDetails (@PathVariable String directChatId){
        List<DirectChatDetailResponse> listDirectChatDetails = chatService.getDirectChatDetailByDirectChatId(directChatId);
        return ApiResponse.success(listDirectChatDetails, "Get Direct Chat Details Success", null);
    }

    @GetMapping("/user/chats")
    public ApiResponse<ListUserDirectChatsResponse> getListUserChats (@AuthenticationPrincipal UserPrincipal userPrincipal, @RequestParam(name = "keyword"
                                                                              ,required = false) String keyword, @RequestParam(name = "pageNumber", defaultValue = "1", required = false) Integer pageNumber,
                                                                      @RequestParam(name = "pageSize", defaultValue = "10", required = false) Integer pageSize){
        ListUserDirectChatsResponse listUserDirectChatsResponse = chatService.getListUserDirectChatsResponse(userPrincipal.getUserId().toString(), keyword, pageNumber, pageSize);
        return ApiResponse.success(listUserDirectChatsResponse, "Get User Direct Chat Success", null);
    }

    @GetMapping("/user/{chatId}/messages")
    public ApiResponse<ListDirectChatMessagesResponse> getDirectChatMessages(
            @PathVariable String chatId,
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "pageNumber", defaultValue = "1", required = false) Integer pageNumber,
            @RequestParam(name = "pageSize", defaultValue = "20", required = false) Integer pageSize) {
        ListDirectChatMessagesResponse messages = chatService.getDirectChatMessages(chatId, keyword, pageNumber, pageSize);
        return ApiResponse.success(messages, "Get Direct Chat Messages Success", null);
    }



}
