package com.lkl.studygroup.controller;

import com.lkl.studygroup.common.ApiResponse;
import com.lkl.studygroup.dto.request.CreateMeetingRequest;
import com.lkl.studygroup.dto.response.ListMeetingWithTotalResponse;
import com.lkl.studygroup.dto.response.MeetingResponse;
import com.lkl.studygroup.model.UserPrincipal;
import com.lkl.studygroup.service.MeetingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/meetings")
public class MeetingController {
    @Autowired
    private MeetingService meetingService;

    @PostMapping("/{groupId}/create-meeting")
    public ApiResponse<MeetingResponse> createMeeting(@PathVariable UUID groupId, @AuthenticationPrincipal UserPrincipal  userPrincipal, @RequestBody CreateMeetingRequest createMeetingRequest){
        MeetingResponse meetingResponse = meetingService.createMeeting(groupId, userPrincipal.getUserId(), createMeetingRequest);
        return ApiResponse.success(meetingResponse,"create success",null);
    }

    @GetMapping("/{groupId}/meetings")
    public ApiResponse<ListMeetingWithTotalResponse>  listMeetingsByGroupId (@PathVariable UUID groupId,
                                                      @RequestParam(name = "pageNumber", defaultValue = "1", required = false) Integer pageNumber,
                                                      @RequestParam(name = "pageSize", defaultValue = "2", required = false) Integer pageSize,
                                                      @RequestParam(name = "sortBy", defaultValue = "startedAt", required = false) String sortBy,
                                                      @RequestParam(name = "sortOrder", defaultValue = "asc", required = false) String sortOrder){
        ListMeetingWithTotalResponse listMeetingWithTotalResponse = meetingService.getListMeetingsByGroupId(groupId, pageNumber, pageSize, sortBy, sortOrder);
        return ApiResponse.success(listMeetingWithTotalResponse,"list meetings success",null);
    }

    @GetMapping("")
    public ApiResponse<ListMeetingWithTotalResponse>  listMeetingsByUserId (@AuthenticationPrincipal UserPrincipal userPrincipal,
                                                                             @RequestParam(name = "pageNumber", defaultValue = "1", required = false) Integer pageNumber,
                                                                             @RequestParam(name = "pageSize", defaultValue = "10", required = false) Integer pageSize,
                                                                             @RequestParam(name = "sortBy", defaultValue = "startedAt", required = false) String sortBy,
                                                                             @RequestParam(name = "sortOrder", defaultValue = "asc", required = false) String sortOrder){
        ListMeetingWithTotalResponse listMeetingWithTotalResponse = meetingService.getListMeetingsbyUserId(userPrincipal.getUserId(), pageNumber, pageSize, sortBy, sortOrder);
        return ApiResponse.success(listMeetingWithTotalResponse,"list meetings success",null);
    }

}
