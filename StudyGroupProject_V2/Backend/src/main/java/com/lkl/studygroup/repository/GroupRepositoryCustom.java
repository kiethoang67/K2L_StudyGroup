package com.lkl.studygroup.repository;

import com.lkl.studygroup.model.Group;

import java.util.UUID;

public interface GroupRepositoryCustom {
    Group findGroupById(UUID id);
    boolean isGroupNameExist(String groupName);
}
