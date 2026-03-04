package com.lkl.studygroup.controller;

import com.lkl.studygroup.common.ApiResponse;
import com.lkl.studygroup.dto.request.CreateCommentRequest;
import com.lkl.studygroup.dto.response.CreateCommentResponse;
import com.lkl.studygroup.dto.response.GetListCommentsWithTotalResponse;
import com.lkl.studygroup.model.UserPrincipal;
import com.lkl.studygroup.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/sections")
public class CommentController {
    @Autowired
    private CommentService commentService;

    @PostMapping("/{sectionId}/comments")
    public ApiResponse<CreateCommentResponse> createComment (@PathVariable UUID sectionId, @AuthenticationPrincipal UserPrincipal principal, @RequestBody CreateCommentRequest createCommentRequest) {
        CreateCommentResponse createCommentResponse = commentService.createComment(createCommentRequest, sectionId, principal.getUserId());
        return ApiResponse.success(createCommentResponse, "Created comment successfully", null);
    }

    @GetMapping("/{sectionId}/comments")
    public ApiResponse<GetListCommentsWithTotalResponse> getListComments (@PathVariable UUID sectionId,
                                                              @RequestParam(name = "pageNumber", defaultValue = "1", required = false) Integer pageNumber,
                                                              @RequestParam(name = "pageSize", defaultValue = "10", required = false) Integer pageSize,
                                                              @RequestParam(name = "sortBy", defaultValue = "createdAt", required = false) String sortBy,
                                                              @RequestParam(name = "sortOrder", defaultValue = "desc", required = false) String sortOrder){
        GetListCommentsWithTotalResponse response = commentService.getListComments(sectionId, pageNumber, pageSize, sortBy, sortOrder);
        return ApiResponse.success(response, "Get List Comments Success", null);
    }
}

