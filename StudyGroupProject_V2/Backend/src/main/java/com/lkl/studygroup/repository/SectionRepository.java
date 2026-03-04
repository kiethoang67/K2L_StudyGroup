package com.lkl.studygroup.repository;

import com.lkl.studygroup.model.Section;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.UUID;

public interface SectionRepository extends JpaRepository<Section, UUID>, JpaSpecificationExecutor<Section> {
    List<Section> findByGroupId(UUID groupId);
    Section findSectionById(UUID sectionId);
}
