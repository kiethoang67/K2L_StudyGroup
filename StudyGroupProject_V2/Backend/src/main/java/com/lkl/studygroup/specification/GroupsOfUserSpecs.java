package com.lkl.studygroup.specification;

import com.lkl.studygroup.model.GroupMember;
import com.lkl.studygroup.model.enums.MemberStatus;
import org.springframework.data.jpa.domain.Specification;

import java.util.UUID;

public class GroupsOfUserSpecs {
    public static Specification<GroupMember> hasStatusJoined() {
        return (root, query, cb) ->
                cb.notEqual(root.get("status"), MemberStatus.IS_DELETE);
    }

    public static Specification<GroupMember> hasUser(UUID userId) {
        return (root, query, cb) ->
                cb.equal(root.get("user").get("id"), userId);
    }

    public static Specification<GroupMember> keyword(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.isBlank()) {
                return null;
            }
            String like = "%" + keyword.toLowerCase() + "%";
            return cb.like(cb.lower(root.get("group").get("name")), like);
        };
    }
}
