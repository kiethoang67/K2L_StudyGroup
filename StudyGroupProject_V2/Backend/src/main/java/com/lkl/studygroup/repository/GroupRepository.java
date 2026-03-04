package com.lkl.studygroup.repository;

import com.lkl.studygroup.model.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

public interface GroupRepository extends JpaRepository<Group, UUID>, GroupRepositoryCustom {
    Group findGroupById(UUID id);

    boolean isGroupNameExist(String groupName);

    java.util.List<Group> findAllByIsPublicTrue();

    @Query(value = "SELECT * FROM groups g " +
            "WHERE g.is_public = true " +
            "AND g.id NOT IN (SELECT gm.group_id FROM group_members gm WHERE gm.user_id = :userId AND gm.status != 'IS_DELETE') " +
            "AND jsonb_exists_any(g.tags, string_to_array(:interests, ','))", 
            nativeQuery = true)
    org.springframework.data.domain.Page<Group> findPublicGroupsNotJoinedByUserWithMatchingTags(
            @Param("userId") UUID userId, 
            @Param("interests") String interests, 
            org.springframework.data.domain.Pageable pageable);

    @Query(value = "SELECT * FROM groups g " +
            "WHERE g.is_public = true " +
            "AND g.id NOT IN (SELECT gm.group_id FROM group_members gm WHERE gm.user_id = :userId AND gm.status != 'IS_DELETE')", 
            nativeQuery = true)
    org.springframework.data.domain.Page<Group> findPublicGroupsNotJoinedByUser(
            @Param("userId") UUID userId, 
            org.springframework.data.domain.Pageable pageable);

    org.springframework.data.domain.Page<Group> findAllByNameContainingIgnoreCase(String keyword, org.springframework.data.domain.Pageable pageable);

    @Modifying
    @Transactional
    @Query("DELETE FROM Group g WHERE g.createdBy = :createdBy")
    void deleteByCreatedBy(@Param("createdBy") UUID createdBy);
}
