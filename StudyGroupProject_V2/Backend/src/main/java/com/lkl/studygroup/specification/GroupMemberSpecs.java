package com.lkl.studygroup.specification;

import com.lkl.studygroup.model.GroupMember;
import com.lkl.studygroup.model.enums.MemberStatus;
import org.springframework.data.jpa.domain.Specification;

import java.util.UUID;

public class GroupMemberSpecs {

    public static Specification<GroupMember> hasStatusJoined() {
        return (root, query, cb) -> cb.and(
                cb.notEqual(root.get("status"), MemberStatus.IS_DELETE),
                cb.notEqual(root.get("status"), MemberStatus.PENDING)
        );
    }

    public static Specification<GroupMember> inGroup(UUID groupId) {
        return (root, query, cb) ->
                cb.equal(root.get("group").get("id"), groupId);
    }

    public static Specification<GroupMember> keyword(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.isBlank()) {
                return null;
            }
            String like = "%" + keyword.toLowerCase() + "%";
            System.out.println("Like: " + like);
            return cb.or(
                    cb.like(cb.lower(root.get("user").get("firstName")), like),
                    cb.like(cb.lower(root.get("user").get("lastName")), like),
                    cb.like(cb.lower(root.get("user").get("email")), like)
            );
        };
    }
}
