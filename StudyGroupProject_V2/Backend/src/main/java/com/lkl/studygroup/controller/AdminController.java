package com.lkl.studygroup.controller;

import com.lkl.studygroup.common.ApiResponse;
import com.lkl.studygroup.dto.response.AdminStatsDto;
import com.lkl.studygroup.dto.response.GetListGroupWithTotalResponse;
import com.lkl.studygroup.dto.response.GetListUserWithTotalResponse;
import com.lkl.studygroup.repository.GroupRepository;
import com.lkl.studygroup.repository.MeetingRepository;
import com.lkl.studygroup.repository.SectionRepository;
import com.lkl.studygroup.repository.UserRepository;
import com.lkl.studygroup.service.GroupService;
import com.lkl.studygroup.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private SectionRepository sectionRepository;

    @Autowired
    private MeetingRepository meetingRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private GroupService groupService;

    @GetMapping("/stats")
    public ApiResponse<AdminStatsDto> getStats() {
        AdminStatsDto stats = new AdminStatsDto(
                userRepository.count(),
                groupRepository.count(),
                sectionRepository.count(),
                meetingRepository.count()
        );
        return ApiResponse.success(stats, "Statistics fetched", null);
    }

    @GetMapping("/users")
    public ApiResponse<GetListUserWithTotalResponse> getAllUsers(
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "pageNumber", defaultValue = "1") Integer pageNumber,
            @RequestParam(name = "pageSize", defaultValue = "10") Integer pageSize) {
        return ApiResponse.success(userService.getAllUsers(keyword, pageNumber, pageSize), "Users fetched successfully", null);
    }

    @GetMapping("/groups")
    public ApiResponse<GetListGroupWithTotalResponse> getAllGroups(
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "pageNumber", defaultValue = "1") Integer pageNumber,
            @RequestParam(name = "pageSize", defaultValue = "10") Integer pageSize,
            @RequestParam(name = "sortBy", defaultValue = "createdAt") String sortBy,
            @RequestParam(name = "sortOrder", defaultValue = "desc") String sortOrder) {
        return ApiResponse.success(groupService.getAllGroupsAdmin(keyword, pageNumber, pageSize, sortBy, sortOrder), "Groups fetched successfully", null);
    }

    @PatchMapping("/users/{userId}/status")
    public ApiResponse<Void> updateUserStatus(@PathVariable String userId, @RequestParam String status) {
        userService.updateUserStatus(userId, status);
        return ApiResponse.success(null, "User status updated", null);
    }

    @PostMapping("/users/{userId}/ban")
    public ApiResponse<Void> banUser(@PathVariable java.util.UUID userId) {
        userService.banUser(userId);
        return ApiResponse.success(null, "User banned successfully", null);
    }

    @DeleteMapping("/users/{userId}")
    public ApiResponse<Void> deleteUser(@PathVariable java.util.UUID userId) {
        userService.deleteUserAdmin(userId);
        return ApiResponse.success(null, "User deleted successfully", null);
    }

    @DeleteMapping("/groups/{groupId}")
    public ApiResponse<Void> deleteGroup(@PathVariable java.util.UUID groupId) {
        groupService.deleteGroup(groupId);
        return ApiResponse.success(null, "Group deleted successfully", null);
    }
}
