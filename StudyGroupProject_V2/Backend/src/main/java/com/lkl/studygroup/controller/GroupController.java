package com.lkl.studygroup.controller;

import com.lkl.studygroup.common.ApiResponse;
import com.lkl.studygroup.common.annotation.RequireGroupAdmin;
import com.lkl.studygroup.dto.request.*;
import com.lkl.studygroup.dto.response.*;
import com.lkl.studygroup.model.Group;
import com.lkl.studygroup.model.UserPrincipal;
import com.lkl.studygroup.service.GroupService;
import com.lkl.studygroup.service.S3CloudFlareR2Service;
import com.lkl.studygroup.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

import static com.lkl.studygroup.model.enums.GroupRole.ADMIN;

@RestController
@RequestMapping("/api/groups")
public class GroupController {
    @Autowired
    private GroupService groupService;

    @Autowired
    private S3CloudFlareR2Service s3CloudFlareR2Service;
    @Autowired
    private UserService userService;

    @PostMapping("/{groupId}/generate-presign-url-group-banner")
    @RequireGroupAdmin(groupIdParam = "groupId")
    public ApiResponse<UploadFileResponse> generateUploadBanner(@RequestBody UploadFileRequest uploadFileRequest, @PathVariable UUID groupId) {
        String customFileName = groupId+"_"+uploadFileRequest.getFileName();
        String url = s3CloudFlareR2Service.generateUploadUrl("Group", customFileName, uploadFileRequest.getContentType());
        String publicBannerUrl = s3CloudFlareR2Service.buildPublicUrl("Group", customFileName);
        UploadFileResponse uploadFileResponse = new UploadFileResponse();
        uploadFileResponse.setUrlUpload(url);
        uploadFileResponse.setPublicUrl(publicBannerUrl);
        return ApiResponse.success(uploadFileResponse,"successful", null);
    }

    @PostMapping("create")
    public ApiResponse<CreateGroupResponse> createGroup(@AuthenticationPrincipal UserPrincipal principal,
            @RequestBody CreateGroupRequest createGroupRequest) {
        UUID creatorId = principal.getUserId();
        CreateGroupResponse createGroupResponse = groupService.createGroup(createGroupRequest, creatorId);
        return ApiResponse.success(createGroupResponse, "Create Success", null);
    }

    @GetMapping("/{id}")
    public ApiResponse<GroupDetailResponse> getGroupById(@PathVariable UUID id) {
        return ApiResponse.success(groupService.getGroupDetail(id), "Get Group Success", null);
    }

    // join
    @PostMapping("/{id}/join")
    public ApiResponse<Void> joinGroup(@PathVariable UUID id, @AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal.getUserId();
        groupService.joinGroup(id, userId);
        return ApiResponse.success(null, "Join Success", null);
    }

    // leave
    @PostMapping("/{id}/leave")
    public ApiResponse<Void> leaveGroup(@PathVariable UUID id, @AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal.getUserId();
        groupService.leaveGroup(id, userId);
        return ApiResponse.success(null, "Leave Success", null);
    }

    // view
    @GetMapping("/listgroup")
    public ApiResponse<GetListGroupWithTotalResponse> getListGroup(@AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "pageNumber", defaultValue = "1", required = false) Integer pageNumber,
            @RequestParam(name = "pageSize", defaultValue = "10", required = false) Integer pageSize,
            @RequestParam(name = "sortBy", defaultValue = "createdAt", required = false) String sortBy,
            @RequestParam(name = "sortOrder", defaultValue = "desc", required = false) String sortOrder) {
        UUID userId = principal.getUserId();
        GetListGroupWithTotalResponse getListGroupResponse = groupService.getListGroup(userId, keyword, pageNumber,
                pageSize, sortBy, sortOrder);
        return ApiResponse.success(getListGroupResponse, "Get List Group Success", null);
    }

    // MODIFIED: New endpoint to expose Public Groups to Frontend with Paging and Filters
    @GetMapping("/public")
    public ApiResponse<GetListGroupWithTotalResponse> getPublicGroups(@AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(name = "pageNumber", defaultValue = "1", required = false) Integer pageNumber,
            @RequestParam(name = "pageSize", defaultValue = "10", required = false) Integer pageSize,
            @RequestParam(name = "sortBy", defaultValue = "created_at", required = false) String sortBy,
            @RequestParam(name = "sortOrder", defaultValue = "desc", required = false) String sortOrder) {
        UUID userId = principal.getUserId();
        GetListGroupWithTotalResponse getListGroupResponse = groupService.getPublicGroups(userId, pageNumber,
                pageSize, sortBy, sortOrder);
        return ApiResponse.success(getListGroupResponse, "Get Public Groups Success", null);
    }

    // delete
    @DeleteMapping("/{id}")
    @RequireGroupAdmin(groupIdParam = "id")
    public ApiResponse<Void> deleteGroup(@PathVariable UUID id) {
        groupService.deleteGroup(id);
        return ApiResponse.success(null, "Delete Group Success", null);
    }

    // view member
    @GetMapping("/{id}/listmember")
    public ApiResponse<GetListMemberWithTotalResponse> getListMember(@PathVariable UUID id,
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "pageNumber", defaultValue = "1", required = false) Integer pageNumber,
            @RequestParam(name = "pageSize", defaultValue = "2", required = false) Integer pageSize,
            @RequestParam(name = "sortBy", defaultValue = "createdAt", required = false) String sortBy,
            @RequestParam(name = "sortOrder", defaultValue = "desc", required = false) String sortOrder) {
        GetListMemberWithTotalResponse getListMemberWithTotalResponse = groupService.getListMember(id, keyword,
                pageNumber, pageSize, sortBy, sortOrder);
        return ApiResponse.success(getListMemberWithTotalResponse, "Get List Member Success", null);
    }

    // add
    @PostMapping("/{id}/addmember")
    @RequireGroupAdmin(groupIdParam = "id")
    public ApiResponse<Void> getListMember(@PathVariable UUID id, @RequestBody AddMemberRequest addMemberRequest) {
        groupService.addMember(id, addMemberRequest);
        return ApiResponse.success(null, "Add Success", null);
    }

    // edit
    @RequireGroupAdmin(groupIdParam = "id")
    @PatchMapping("/{id}/update")
    public ApiResponse<EditGroupDetailResponse> updateGroupDetail(@PathVariable UUID id,
            @RequestBody EditGroupDetailRequest editGroupDetailRequest) {
        EditGroupDetailResponse group = groupService.editGroupDetail(id, editGroupDetailRequest);
        return ApiResponse.success(group, "update Success", null);
    }

    @RequireGroupAdmin(groupIdParam = "id")
    @PostMapping("/{id}/assignAdmin")
    public ApiResponse<Void> assignAdmin(@AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody AssignAdminRequest assignAdminRequest, @PathVariable UUID id) {
        groupService.assignAdmin(id, assignAdminRequest, userPrincipal);
        return ApiResponse.success(null, "Assign Success", null);
    }

    @RequireGroupAdmin(groupIdParam = "id")
    @DeleteMapping("/{id}/members/{memberId}")
    public ApiResponse<Void> removeMember(@PathVariable UUID id, @PathVariable UUID memberId) {
        groupService.removeMember(id, memberId);
        return ApiResponse.success(null, "Remove Member Success", null);
    }

    @PostMapping("/{groupId}/inviteUser")
    public ApiResponse<Void> inviteUser (@PathVariable UUID groupId, @RequestBody AddMemberRequest addMemberRequest) {
        groupService.inviteMember(groupId, addMemberRequest);
        return ApiResponse.success(null, "Invite User Success", null);
    }

    @PostMapping("/{groupId}/responseInvite")
    public ApiResponse<Void> responseInvite (@PathVariable UUID groupId, @AuthenticationPrincipal UserPrincipal userPrincipal, @RequestBody DecisionRequest decisionRequest){
        groupService.responseInvite(groupId, userPrincipal.getUserId(), decisionRequest.isDecision());
        String message ="";
        if(decisionRequest.isDecision()){
            message = "accept success";
        }else{
            message = "decline success";
        }
        return ApiResponse.success(null, message, null);
    }
}
