package com.lkl.studygroup.repository;

import com.lkl.studygroup.dto.response.ListInvitation;
import com.lkl.studygroup.model.Group;
import com.lkl.studygroup.model.GroupMember;
import com.lkl.studygroup.model.User;
import com.lkl.studygroup.model.embedded.GroupMemberId;
import com.lkl.studygroup.model.enums.MemberStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;
import java.util.UUID;

public interface GroupMemberRepository extends JpaRepository<GroupMember, GroupMemberId>,
        GroupMemberRepositoryCustom, JpaSpecificationExecutor<GroupMember> {
    GroupMember findGroupMemberById (GroupMemberId groupMemberId);

    
    @Modifying
    @Transactional
    @Query("DELETE FROM GroupMember gm WHERE gm.id.userId = :userId")
    void deleteByUserId(@Param("userId") UUID userId);
    @Query("SELECT u FROM GroupMember gm Join User u on u.id = gm.id.userId WHERE gm.id.groupId = :groupId")
    List<User> findUsersByGroupId(@Param("groupId") UUID groupId);
    @Query("SELECT gm.id.userId FROM GroupMember gm WHERE gm.id.groupId = :groupId")
    List<String> findUserIdsByGroupId(@Param("groupId") UUID groupId);
    @Query("SELECT g FROM GroupMember gm JOIN Group g on g.id = gm.id.groupId WHERE gm.id.userId = :userId AND gm.status = :status AND (:keyword IS NULL OR LOWER(g.name) LIKE :keyword )")
    Page<Group> listGroupMemberByUserIdAndStatus (@Param("userId") UUID userId, @Param("status")MemberStatus status, @Param("keyword") String keyword, Pageable pageable);
    @Query("SELECT gm FROM GroupMember gm where gm.id = :groupMemberId AND gm.status = :status")
    GroupMember findGroupMemberByIdAndStatus(@Param("groupMemberId") GroupMemberId groupMemberId, @Param("status")MemberStatus status);
    @Query("Select gm.id.groupId from GroupMember gm where gm.id.userId =:userId")
    List<UUID> findGroupIdsByUserId(@Param("userId") UUID userId);
}
