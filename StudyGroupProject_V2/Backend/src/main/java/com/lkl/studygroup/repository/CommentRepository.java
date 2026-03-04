package com.lkl.studygroup.repository;

import com.lkl.studygroup.model.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface CommentRepository extends JpaRepository<Comment, UUID>, JpaSpecificationExecutor<Comment> {
    @Query("""
       SELECT c
       FROM Comment c
       WHERE c.sectionId = :sectionId
       ORDER BY c.createdAt DESC
       """)
    Page<Comment> findBySectionId(@Param("sectionId") UUID sectionId, Pageable page);
}
