package com.lkl.studygroup.controller;

import com.lkl.studygroup.common.ApiResponse;
import com.lkl.studygroup.dto.request.*;
import com.lkl.studygroup.dto.response.ListInvitation;
import com.lkl.studygroup.dto.response.ProfileResponse;
import com.lkl.studygroup.dto.response.UploadFileResponse;
import com.lkl.studygroup.dto.response.UserProfileDto;
import com.lkl.studygroup.model.User;
import com.lkl.studygroup.service.S3CloudFlareR2Service;
import com.lkl.studygroup.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.lkl.studygroup.model.UserPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private S3CloudFlareR2Service s3CloudFlareR2Service;
    @PostMapping("/generate-presign-url-avatar")
    public ApiResponse<UploadFileResponse> generateUploadFile(@RequestBody UploadFileRequest uploadFileRequest, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String userId = userPrincipal.getUserId().toString();
        String customFileName = userId+"_"+uploadFileRequest.getFileName();
        String url = s3CloudFlareR2Service.generateUploadUrl("Avatar", customFileName, uploadFileRequest.getContentType());
        String publicAvatarUrl = s3CloudFlareR2Service.buildPublicUrl("Avatar", customFileName);
//        UserUpdateRequest userUpdateRequest = new UserUpdateRequest();
//        userUpdateRequest.setAvatarUrl(publicAvatarUrl);
//        userService.updateUser(userPrincipal.getEmail(),userUpdateRequest);
        UploadFileResponse uploadFileResponse = new UploadFileResponse();
        uploadFileResponse.setUrlUpload(url);
        uploadFileResponse.setPublicUrl(publicAvatarUrl);
        return ApiResponse.success(uploadFileResponse,"successful", null);
    }
    @GetMapping("/profile")
    public ApiResponse<ProfileResponse> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        String email = principal.getEmail();
        UserProfileDto userProfileDto = userService.getUserByEmail(email);
        ProfileResponse profileResponse = new ProfileResponse(userProfileDto);
        return ApiResponse.success(profileResponse,"success",null);
    }

    @PatchMapping("/me")
    public ResponseEntity<User> updateCurrentUser(@AuthenticationPrincipal UserPrincipal principal, @RequestBody UserUpdateRequest request) {
        String email = principal.getEmail();
        System.out.println("email: "+email);
        User updatedUser = userService.updateUser(email, request);
        return ResponseEntity.ok(updatedUser);
    }
    @PostMapping("/changePass")
    public ApiResponse<Void> changePassword(@AuthenticationPrincipal UserPrincipal principal, @RequestBody ChangePasswordRequest changePasswordRequest) {
        userService.changePassword(changePasswordRequest,principal);
        return ApiResponse.success(null,"change success",null);
    }

    @DeleteMapping("/deleteAccount")
    public ApiResponse<Void> deleteAccount(@RequestBody DeleteAccountRequest deleteAccountRequest, @AuthenticationPrincipal UserPrincipal principal) {
        userService.deleteAccount(deleteAccountRequest, principal);
        return ApiResponse.success(null,"delete success",null);
    }
    @PostMapping("/deactivateAccount")
    public ApiResponse<Void> deactivatedAccount (@AuthenticationPrincipal UserPrincipal principal){
        userService.deactivatedAccount(principal);
        return ApiResponse.success(null,"deactivated success",null);
    }
    @GetMapping("/invitations")
    public ApiResponse<ListInvitation> getListInvitations (@AuthenticationPrincipal UserPrincipal principal, @RequestParam(name = "keyword", required = false) String keyword,
                                                           @RequestParam(name = "pageNumber", defaultValue = "1", required = false) Integer pageNumber,
                                                           @RequestParam(name = "pageSize", defaultValue = "20", required = false) Integer pageSize) {
        ListInvitation listInvitation = userService.getListInvitation(principal.getUserId(), keyword, pageNumber, pageSize);
        return ApiResponse.success(listInvitation, "get list invitation success", null);

    }
    @PostMapping("/forgot-password")
    public ApiResponse<String> forgotPassword (@RequestBody ForgotPasswordRequest forgotPasswordRequest) {
        User user = userService.findByEmail(forgotPasswordRequest.getEmail());
        userService.forgotPassword(user);
        return ApiResponse.success(null,"forgot password success",null);
    }

    @PostMapping("/forgot-password-change")
    public ApiResponse<Void> forgotPasswordChange (@RequestBody ForgotPasswordChangeRequest forgotPasswordChangeRequest) {
        userService.forgotPasswordChange(forgotPasswordChangeRequest);
        return ApiResponse.success(null,"forgot password change success",null);
    }

}
