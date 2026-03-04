package com.lkl.studygroup.controller;

import com.lkl.studygroup.common.ApiResponse;
import com.lkl.studygroup.common.annotation.RequireGroupAdmin;
import com.lkl.studygroup.dto.request.CreateSectionRequest;
import com.lkl.studygroup.dto.request.EditGroupDetailRequest;
import com.lkl.studygroup.dto.request.EditSectionRequest;
import com.lkl.studygroup.dto.request.UploadFileRequest;
import com.lkl.studygroup.dto.response.CreateSectionResponse;
import com.lkl.studygroup.dto.response.EditSectionResponse;
import com.lkl.studygroup.dto.response.GetListSectionsWithTotalResponse;
import com.lkl.studygroup.dto.response.UploadFileResponse;
import com.lkl.studygroup.model.Group;
import com.lkl.studygroup.model.UserPrincipal;
import com.lkl.studygroup.service.GroupService;
import com.lkl.studygroup.service.S3CloudFlareR2Service;
import com.lkl.studygroup.service.SectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/sections")
public class SectionController {
    @Autowired
    private S3CloudFlareR2Service s3CloudFlareR2Service;
    @Autowired
    private SectionService sectionService;
    @Autowired
    private GroupService groupService;
    @PostMapping("/{groupId}/createSection")
    public ApiResponse<CreateSectionResponse> createSection(@RequestBody CreateSectionRequest createSectionRequest, @AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID groupId) {
        Group group = groupService.findByGroupId(groupId);
        CreateSectionResponse createSectionResponse = sectionService.createSection(principal.getUserId(),group, createSectionRequest);
        return ApiResponse.success(createSectionResponse, "Create Success", null);
    }

    @GetMapping("/{groupId}/listSection")
    public ApiResponse<GetListSectionsWithTotalResponse> getSections(@PathVariable UUID groupId, @RequestParam(name = "keyword", required = false) String keyword,
                                                         @RequestParam(name = "pageNumber", defaultValue = "1", required = false) Integer pageNumber,
                                                         @RequestParam(name = "pageSize", defaultValue = "10", required = false) Integer pageSize,
                                                         @RequestParam(name = "sortBy", defaultValue = "createdAt", required = false) String sortBy,
                                                         @RequestParam(name = "sortOrder", defaultValue = "desc", required = false) String sortOrder) {
        GetListSectionsWithTotalResponse response = sectionService.getListSections(groupId, keyword, pageNumber, pageSize, sortBy, sortOrder);
        return ApiResponse.success(response, "Get List Sections Success", null);
    }

    @PostMapping("/{sectionId}/generate-presign-url-attachments")
    public ApiResponse<UploadFileResponse> generateUploadAttachments(@RequestBody UploadFileRequest uploadFileRequest, @PathVariable UUID sectionId) {
        String customFileName = sectionId+"_"+uploadFileRequest.getFileName();
        String url = s3CloudFlareR2Service.generateUploadUrl("Section", customFileName, uploadFileRequest.getContentType());
        String publicAttachmentUrl = s3CloudFlareR2Service.buildPublicUrl("Section", customFileName);
        UploadFileResponse uploadFileResponse = new UploadFileResponse();
        uploadFileResponse.setUrlUpload(url);
        uploadFileResponse.setPublicUrl(publicAttachmentUrl);
        return ApiResponse.success(uploadFileResponse,"successful", null);
    }

    @PatchMapping("/{sectionId}/edit")
    public ApiResponse<EditSectionResponse> editSection(@RequestBody EditSectionRequest editSectionRequest, @PathVariable UUID sectionId, @AuthenticationPrincipal UserPrincipal principal) {
        EditSectionResponse editSectionResponse = sectionService.editSection(principal.getUserId(),sectionId, editSectionRequest);
        return ApiResponse.success(editSectionResponse, "Edit Success", null);
    }

}

