package com.lkl.studygroup.specification;

import com.lkl.studygroup.model.Comment;
import org.springframework.data.jpa.domain.Specification;

import java.util.UUID;

public class CommentSpecs {

    public static Specification<Comment> inSection(UUID sectionId) {
        return (root, query, cb) ->
                cb.equal(root.get("sectionId"), sectionId);
    }
}
