package com.lkl.studygroup.repository;

import com.lkl.studygroup.model.Group;
import com.lkl.studygroup.model.GroupMember;
import com.lkl.studygroup.model.User;
import com.lkl.studygroup.model.embedded.GroupMemberId;
import com.lkl.studygroup.model.enums.GroupRole;

import java.util.List;
import java.util.UUID;

public interface GroupMemberRepositoryCustom {
    GroupMember findGroupMemberById(GroupMemberId groupMemberId);
    List<Group> findGroupsByUserId(UUID userId);
    List<User>  findUsersByGroupId(UUID groupId);
    boolean existsByGroupIdAndUserIdAndRole(
            UUID groupId,
            UUID userId
            );
    boolean existsByGroupIdAndUserId(UUID groupId, UUID userId);
}
