package com.lkl.studygroup.service;

import com.lkl.studygroup.dto.request.AddMemberRequest;
import com.lkl.studygroup.dto.request.AssignAdminRequest;
import com.lkl.studygroup.dto.request.CreateGroupRequest;
import com.lkl.studygroup.dto.request.EditGroupDetailRequest;
import com.lkl.studygroup.dto.response.*;
import com.lkl.studygroup.enums.ErrorCode;
import com.lkl.studygroup.exception.ExceptionResponse;
import com.lkl.studygroup.model.Group;
import com.lkl.studygroup.model.GroupMember;
import com.lkl.studygroup.model.User;
import com.lkl.studygroup.model.UserPrincipal;
import com.lkl.studygroup.model.embedded.GroupMemberId;
import com.lkl.studygroup.model.enums.GroupRole;
import com.lkl.studygroup.model.enums.MemberStatus;
import com.lkl.studygroup.repository.GroupMemberRepository;
import com.lkl.studygroup.repository.GroupRepository;
import com.lkl.studygroup.repository.UserRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.lkl.studygroup.specification.GroupMemberSpecs;
import com.lkl.studygroup.specification.GroupsOfUserSpecs;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@Service
public class GroupService {
    @Autowired
    private GroupRepository groupRepository;
    @Autowired
    private GroupMemberRepository groupMemberRepository;
    @Autowired
    private UserRepository userRepository;

    public CreateGroupResponse createGroup(CreateGroupRequest createGroupRequest, UUID creatorId) {
        if (groupRepository.isGroupNameExist(createGroupRequest.getName())) {
            throw new ExceptionResponse(ErrorCode.GROUP_NAME_IS_EXIST);
        }
        Group group = new Group();
        group.setName(createGroupRequest.getName());
        group.setIsPublic(createGroupRequest.getIsPublic());
        group.setDescription(createGroupRequest.getDescription());
        group.setTags(createGroupRequest.getTags());
        group.setCreatedBy(creatorId);
        groupRepository.save(group);
        GroupMemberId groupMemberId = new GroupMemberId(creatorId, group.getId());
        GroupMember groupMember = new GroupMember();
        groupMember.setId(groupMemberId);
        // groupMember.setCreatedBy(creatorId);
        groupMember.setGroup(group);
        groupMember.setRole(GroupRole.ADMIN);
        groupMember.setStatus(MemberStatus.JOINED);
        groupMemberRepository.save(groupMember);
        return new CreateGroupResponse(group.getName(), group.getId());
    }

    public GroupDetailResponse getGroupDetail(UUID id) {
        Group group = groupRepository.findGroupById(id);
        if (group == null) {
            throw new ExceptionResponse(ErrorCode.GROUP_NOT_FOUND);
        }
        User user = userRepository.findUserById(group.getCreatedBy().toString());
        String createdByUser = user.getFirstName() + " " + user.getLastName();
        return new GroupDetailResponse(group, createdByUser);
    }

    // join group: cần group id.
    public void joinGroup(UUID groupId, UUID userId) {
        GroupMemberId groupMemberId = new GroupMemberId(userId, groupId);
        Group group = groupRepository.findGroupById(groupId);
        GroupMember groupMember = new GroupMember();
        groupMember.setId(groupMemberId);
        groupMember.setGroup(group);
        groupMember.setRole(GroupRole.MEMBER);
        groupMember.setStatus(MemberStatus.JOINED);
        groupMemberRepository.save(groupMember);
    }

    // leave group: cần group id + user id (phải viết ham)
    public void leaveGroup(UUID groupId, UUID userId) {
        GroupMemberId groupMemberId = new GroupMemberId(userId, groupId);
        GroupMember groupMember = groupMemberRepository.findGroupMemberById(groupMemberId);
        groupMember.setStatus(MemberStatus.IS_DELETE);
        groupMemberRepository.save(groupMember);
    }

    // view list group: phải tạo một class response
    public GetListGroupWithTotalResponse getListGroup(UUID userId, String keyword, Integer pageNumber, Integer pageSize,
            String sortBy, String sortOrder) {
        Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageDetails = PageRequest.of(pageNumber - 1, pageSize, sortByAndOrder);
        Specification<GroupMember> spec = Specification.allOf(
                GroupsOfUserSpecs.hasStatusJoined(),
                GroupsOfUserSpecs.hasUser(userId),
                GroupsOfUserSpecs.keyword(keyword));
        Page<GetListGroupResponse> result = groupMemberRepository.findAll(spec, pageDetails)
                .map(gm -> new GetListGroupResponse(
                        gm.getGroup().getId(),
                        gm.getGroup().getName(),
                        gm.getRole(),
                        gm.getGroup().getTags(),
                        gm.getGroup().getDescription(),
                        gm.getGroup().getIsPublic()));
        GetListGroupWithTotalResponse listGroupWithTotalResponse = new GetListGroupWithTotalResponse(
                result.getContent(), result.getTotalElements());
        return listGroupWithTotalResponse;
    }

    // MODIFIED: Implementation for fetching Public Groups with Paging and Filters
    public GetListGroupWithTotalResponse getPublicGroups(UUID userId, Integer pageNumber, Integer pageSize,
            String sortBy, String sortOrder) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ExceptionResponse(ErrorCode.USER_NOT_FOUND));
        List<String> interests = user.getInterests();
        
        Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageDetails = PageRequest.of(pageNumber - 1, pageSize, sortByAndOrder);

        Page<Group> resultPage;
        if (interests == null || interests.isEmpty()) {
            resultPage = groupRepository.findPublicGroupsNotJoinedByUser(userId, pageDetails);
        } else {
            String interestsStr = String.join(",", interests);
            resultPage = groupRepository.findPublicGroupsNotJoinedByUserWithMatchingTags(userId, interestsStr, pageDetails);
        }

        List<GetListGroupResponse> groups = resultPage.getContent().stream()
                .map(group -> new GetListGroupResponse(
                        group.getId(),
                        group.getName(),
                        null, // No role for public view
                        group.getTags(),
                        group.getDescription(),
                        group.getIsPublic()))
                .collect(java.util.stream.Collectors.toList());

        return new GetListGroupWithTotalResponse(groups, resultPage.getTotalElements());
    }


    // public List<String> GetListMemberId (String groupId){
    // List<String> listMemberId =
    // groupMemberRepository.findUserIdsByGroupId(groupId);
    // return listMemberId;
    // }
    // get list member: (user id + first name + last name + membership + email)
    public GetListMemberWithTotalResponse getListMember(UUID groupId, String keyword, Integer pageNumber,
            Integer pageSize, String sortBy, String sortOrder) {
        Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        // Tao offset, tao limit, ...
        Pageable pageDetails = PageRequest.of(pageNumber - 1, pageSize, sortByAndOrder);

        Specification<GroupMember> spec = Specification.allOf(
                GroupMemberSpecs.hasStatusJoined(),
                GroupMemberSpecs.inGroup(groupId),
                GroupMemberSpecs.keyword(keyword));

        Page<GetMemberResponse> result = groupMemberRepository.findAll(spec, pageDetails)
                .map(gm -> new GetMemberResponse(
                        gm.getUser().getId(),
                        gm.getUser().getFirstName(),
                        gm.getUser().getLastName(),
                        gm.getUser().getEmail(),
                        gm.getRole(),
                        gm.getUser().getAvatarUrl()));
        GetListMemberWithTotalResponse listMemberWithTotalResponse = new GetListMemberWithTotalResponse(
                result.getContent(), result.getTotalElements());
        return listMemberWithTotalResponse;
    }

    // Edit group detail: groupid (tạo class request và check request)
    public EditGroupDetailResponse editGroupDetail(UUID groupId, EditGroupDetailRequest editGroupDetailRequest) {
        Group group = groupRepository.findGroupById(groupId);
        if (editGroupDetailRequest.getName() != null) {
            group.setName(editGroupDetailRequest.getName());
        }
        if (editGroupDetailRequest.getDescription() != null) {
            group.setDescription(editGroupDetailRequest.getDescription());
        }
        if (editGroupDetailRequest.getTags() != null) {
            group.setTags(editGroupDetailRequest.getTags());
        }
        if (editGroupDetailRequest.getIsPublic() != null) {
            group.setIsPublic(editGroupDetailRequest.getIsPublic());
        }
        if (editGroupDetailRequest.getBannerUrl() != null) {
            group.setBannerUrl(editGroupDetailRequest.getBannerUrl());
        }
        groupRepository.save(group);
        return new EditGroupDetailResponse(group);
    }

    // add member: (admin add) (input email + group id) (tạo class cho truyền email)
    public void addMember(UUID groupId, AddMemberRequest addMemberRequest) {
        User user = userRepository.findByEmail(addMemberRequest.getEmail());
        if (user == null) {
            throw new ExceptionResponse(ErrorCode.USER_NOT_FOUND);
        }
        if (groupMemberRepository.existsByGroupIdAndUserId(groupId, user.getId())) {
            throw new ExceptionResponse(ErrorCode.USER_IS_ALREADY_EXISTED);
        }
        GroupMemberId groupMemberId = new GroupMemberId(user.getId(), groupId);
        Group group = groupRepository.findGroupById(groupId);
        GroupMember groupMember = new GroupMember();
        groupMember.setId(groupMemberId);
        groupMember.setGroup(group);
        groupMember.setRole(GroupRole.MEMBER);
        groupMember.setStatus(MemberStatus.JOINED);
        groupMemberRepository.save(groupMember);
    }

    public void inviteMember(UUID groupId, AddMemberRequest addMemberRequest) {
        User user = userRepository.findByEmail(addMemberRequest.getEmail());
        if (user == null) {
            throw new ExceptionResponse(ErrorCode.USER_NOT_FOUND);
        }
        if (groupMemberRepository.existsByGroupIdAndUserId(groupId, user.getId())) {
            throw new ExceptionResponse(ErrorCode.USER_IS_ALREADY_EXISTED);
        }
        GroupMemberId groupMemberId = new GroupMemberId(user.getId(), groupId);
        Group group = groupRepository.findGroupById(groupId);
        GroupMember groupMember = new GroupMember();
        groupMember.setId(groupMemberId);
        groupMember.setGroup(group);
        groupMember.setRole(GroupRole.MEMBER);
        groupMember.setStatus(MemberStatus.PENDING);
        groupMemberRepository.save(groupMember);
    }

    // delete group (groupid)
    public void deleteGroup(UUID groupId) {
        groupRepository.deleteById(groupId);
    }

    public boolean findGroupMemberById(UUID groupId, UUID userId) {
        GroupMemberId groupMemberId = new GroupMemberId(userId, groupId);
        GroupMember groupMember = groupMemberRepository.findGroupMemberById(groupMemberId);
        if (groupMember == null) {
            return false;
        }
        return true;
    }

    public void assignAdmin(UUID groupId, AssignAdminRequest assignAdminRequest, UserPrincipal userPrincipal) {
        GroupMember groupMember1 = groupMemberRepository
                .findGroupMemberById(new GroupMemberId(userPrincipal.getUserId(), groupId));
        groupMember1.setRole(GroupRole.MEMBER);
        groupMemberRepository.save(groupMember1);
        GroupMember groupMember2 = groupMemberRepository
                .findGroupMemberById(new GroupMemberId(assignAdminRequest.getUserId(), groupId));
        groupMember2.setRole(GroupRole.ADMIN);
        groupMemberRepository.save(groupMember2);
    }

    public void removeMember(UUID groupId, UUID memberId) {
        System.out.println("DEBUG: removeMember called with groupId=" + groupId + ", memberId=" + memberId);
        GroupMemberId groupMemberId = new GroupMemberId(memberId, groupId);
        System.out.println("DEBUG: Constructed GroupMemberId: userId=" + groupMemberId.getUserId() + ", groupId="
                + groupMemberId.getGroupId());

        if (groupMemberRepository.existsById(groupMemberId)) {
            System.out.println("DEBUG: Member found, deleting...");
            groupMemberRepository.deleteById(groupMemberId);
            System.out.println("DEBUG: Delete successful");
        } else {
            System.out.println("DEBUG: Member NOT found");
            throw new ExceptionResponse(ErrorCode.USER_NOT_FOUND);
        }
    }

    public Page<Group> getGroupMembersByUserIdAndStatus(UUID userId, MemberStatus status, String keyword,
            Pageable pageable) {
        System.out.println("Status ne:" + status);
        System.out.println("keyword:" + keyword);
        System.out.println("Id" + userId);
        keyword = (keyword == null || keyword.isBlank())
                ? null
                : "%" + keyword.toLowerCase() + "%";

        Page<Group> groups = groupMemberRepository.listGroupMemberByUserIdAndStatus(userId, status, keyword, pageable);
        return groups;
    }

    public void responseInvite(UUID groupId, UUID userId, boolean decision) {
        Group group = groupRepository.findGroupById(groupId);
        if (group == null) {
            throw new ExceptionResponse(ErrorCode.GROUP_NOT_FOUND);
        }
        GroupMember groupMember = groupMemberRepository.findGroupMemberByIdAndStatus(new GroupMemberId(userId, groupId),
                MemberStatus.PENDING);
        if (groupMember == null) {
            throw new ExceptionResponse(ErrorCode.USER_NOT_IN_GROUP);
        }
        if (!decision) {
            removeMember(groupId, userId);
        } else {
            groupMember.setStatus(MemberStatus.JOINED);
            groupMemberRepository.save(groupMember);
        }
    }

    public Group findByGroupId(UUID groupId) {
        Group group = groupRepository.findGroupById(groupId);
        if (group == null) {
            throw new ExceptionResponse(ErrorCode.GROUP_NOT_FOUND);
        }
        return group;
    }

    public List<UUID> getListGroupIdsByUserId(UUID userId) {
        List<UUID> groupIds = groupMemberRepository.findGroupIdsByUserId(userId);
        return groupIds;
    }

    public GetListGroupWithTotalResponse getAllGroupsAdmin(String keyword, Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
        Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(pageNumber - 1, pageSize, sortByAndOrder);

        Page<Group> result;
        if (keyword != null && !keyword.isBlank()) {
            result = groupRepository.findAllByNameContainingIgnoreCase(keyword, pageable);
        } else {
            result = groupRepository.findAll(pageable);
        }

        List<GetListGroupResponse> groups = result.getContent().stream()
                .map(group -> new GetListGroupResponse(
                        group.getId(),
                        group.getName(),
                        null,
                        group.getTags(),
                        group.getDescription(),
                        group.getIsPublic()
                ))
                .collect(java.util.stream.Collectors.toList());

        return new GetListGroupWithTotalResponse(groups, result.getTotalElements());
    }
}
