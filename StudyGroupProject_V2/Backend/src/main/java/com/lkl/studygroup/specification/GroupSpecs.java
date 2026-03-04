package com.lkl.studygroup.specification;

import com.lkl.studygroup.model.Group;
import com.lkl.studygroup.model.GroupMember;
import com.lkl.studygroup.model.enums.MemberStatus;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.UUID;

public class GroupSpecs {

    public static Specification<Group> isPublic() {
        return (root, query, cb) -> cb.isTrue(root.get("isPublic"));
    }

    public static Specification<Group> notJoinedByUser(UUID userId) {
        return (root, query, cb) -> {
            // Subquery to find groups where the user is a member
            var subquery = query.subquery(UUID.class);
            Join<Group, GroupMember> members = subquery.from(Group.class).join("members");
            subquery.select(members.get("group").get("id"))
                    .where(cb.and(
                            cb.equal(members.get("user").get("id"), userId),
                            cb.notEqual(members.get("status"), MemberStatus.IS_DELETE)
                    ));
            
            return cb.not(root.get("id").in(subquery));
        };
    }

    public static Specification<Group> hasCommonTags(List<String> interests) {
        return (root, query, cb) -> {
            if (interests == null || interests.isEmpty()) {
                return cb.conjunction(); // If no interests, don't filter by tags (or should it return nothing? assuming user wants to see groups anyway if they have no interests, but the prompt says they must have common tags)
                // Actually user request: "có tag trùng với 1 or nhiều tag với user"
                // This means if user has NO tags, or groups have NO tags, they won't match.
                // However, if the user has NO interests, we might want to return nothing if we strictly follow "trùng".
            }
            
            // PostgreSQL JSONB overlap operator: tags ?| array['tag1', 'tag2']
            // Or use a more portable approach if possible, but tags is jsonb.
            // In JPA, we can use function('jsonb_path_exists', ...) or similar if supported, 
            // but native function call is usually needed for specialized jsonb operators.
            
            // For now, let's use a simple overlap simulation if possible or a native-ish predicate.
            // Since `tags` is defined with @JdbcTypeCode(SqlTypes.JSON), we can use:
            // cb.function('jsonb_exists_any', Boolean.class, root.get("tags"), cb.literal(interests.toArray(new String[0])))
            // But 'jsonb_exists_any' isn't a standard function.
            
            // Alternative: use a string comparison if we can't easily do json overlap in JPA Criteria.
            // But let's try a custom predicate for PostgreSQL JSONB.
            
            return cb.isTrue(cb.function("jsonb_exists_any", Boolean.class, root.get("tags"), cb.literal(String.join(",", interests))));
            // NOTE: This assumes we might need to register a custom function or use a native query if this fails.
            // Actually, let's use a simpler approach: check if ANY tag in user interests is in group tags.
            // Since we don't have a built-in "jsonb_overlap", we might have to use a native query or a custom function.
        };
    }
    
    // Improved hasCommonTags using a native-like expression for PostgreSQL
    public static Specification<Group> hasCommonTagsPostgreSQL(List<String> interests) {
        return (root, query, cb) -> {
            if (interests == null || interests.isEmpty()) {
                return cb.disjunction(); // No interests, no match
            }
            
            // Using the ?| operator (at least one of these strings exists as a top-level key/array element)
            // Usage in Criteria: cb.isTrue(cb.function("jsonb_exists_any", Boolean.class, root.get("tags"), cb.literal(interests)))
            // However, Hibernate might not support ?| directly. 
            // Let's use a simpler approach if we can: join or a more common function.
            
            // Given the complexity of JSONB in JPA Criteria, a Native Query in Repository might be cleaner.
            // But I'll try to stick to Specifications if I can find a way.
            return null; // Placeholder for now, I'll implement in Repository if Criteria is too messy.
        };
    }
}
