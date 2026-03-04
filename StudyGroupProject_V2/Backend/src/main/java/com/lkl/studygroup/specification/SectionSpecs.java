package com.lkl.studygroup.specification;

import com.lkl.studygroup.model.Section;
import org.springframework.data.jpa.domain.Specification;

import java.util.UUID;

public class SectionSpecs {

    public static Specification<Section> inGroup(UUID groupId) {
        return (root, query, cb) ->
                cb.equal(root.get("groupId"), groupId);
    }

    public static Specification<Section> keyword(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.isBlank()) {
                return null;
            }
            String like = "%" + keyword.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("content")), like),
                    cb.like(cb.lower(root.get("creator").get("firstName")), like),
                    cb.like(cb.lower(root.get("creator").get("lastName")), like),
                    cb.like(cb.lower(root.get("creator").get("email")), like)
            );
        };
    }
}
