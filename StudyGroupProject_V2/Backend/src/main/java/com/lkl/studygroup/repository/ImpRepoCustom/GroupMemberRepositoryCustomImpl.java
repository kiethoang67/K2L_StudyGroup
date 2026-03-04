package com.lkl.studygroup.repository.ImpRepoCustom;

import com.lkl.studygroup.model.Group;
import com.lkl.studygroup.model.GroupMember;
import com.lkl.studygroup.model.User;
import com.lkl.studygroup.model.embedded.GroupMemberId;
import com.lkl.studygroup.model.enums.GroupRole;
import com.lkl.studygroup.repository.GroupMemberRepositoryCustom;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.util.List;
import java.util.UUID;

public class GroupMemberRepositoryCustomImpl implements GroupMemberRepositoryCustom {
    
    @PersistenceContext
    private EntityManager entityManager;
    
    @Override
    public GroupMember findGroupMemberById(GroupMemberId groupMemberId) {
        return entityManager.createQuery(
                        "SELECT gm FROM GroupMember gm WHERE gm.id.groupId = :groupId AND gm.id.userId = :userId",
                        GroupMember.class
                )
                .setParameter("groupId", groupMemberId.getGroupId())
                .setParameter("userId", groupMemberId.getUserId())
                .getSingleResult();
    }
    
    @Override
    public List<Group> findGroupsByUserId(UUID userId) {
        return entityManager.createQuery(
                        "SELECT gm.group FROM GroupMember gm WHERE gm.id.userId = :userId AND gm.status = 'JOINED'",
                        Group.class
                )
                .setParameter("userId", userId)
                .getResultList();
    }

    @Override
    public List<User> findUsersByGroupId(UUID groupId) {
        return entityManager.createQuery(
                        "SELECT gm.user FROM GroupMember gm WHERE gm.id.groupId = :groupId AND gm.status = 'JOINED'",
                        User.class
                )
                .setParameter("groupId", groupId)
                .getResultList();
    }

    @Override
    public boolean existsByGroupIdAndUserIdAndRole(UUID groupId, UUID userId) {
        Long count = entityManager.createQuery(
                        """
                        SELECT COUNT(gm)
                        FROM GroupMember gm
                        WHERE gm.id.groupId = :groupId
                          AND gm.id.userId = :userId
                          AND gm.role = :role
                        """,
                        Long.class
                )
                .setParameter("groupId", groupId)
                .setParameter("userId", userId)
                .setParameter("role", GroupRole.ADMIN)
                .getSingleResult();

        return count > 0;
    }

    @Override
    public boolean existsByGroupIdAndUserId(UUID groupId, UUID userId) {
        Long count = entityManager.createQuery(
                        """
                        SELECT COUNT(gm)
                        FROM GroupMember gm
                        WHERE gm.id.groupId = :groupId
                          AND gm.id.userId = :userId
                        """,
                        Long.class
                )
                .setParameter("groupId", groupId)
                .setParameter("userId", userId)
                .getSingleResult();

        return count > 0;
    }
}
