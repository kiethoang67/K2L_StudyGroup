package com.lkl.studygroup.repository.ImpRepoCustom;

import com.lkl.studygroup.model.Group;
import com.lkl.studygroup.model.User;
import com.lkl.studygroup.repository.GroupRepositoryCustom;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.util.UUID;

public class GroupRepositoryCustomImpl implements GroupRepositoryCustom {
    @PersistenceContext
    private EntityManager entityManager;
    @Override
    public Group findGroupById(UUID id) {
        return entityManager.createQuery(
                        "SELECT u FROM Group u WHERE u.id = :id",
                        Group.class
                )
                .setParameter("id", id)
                .getSingleResult();
    }

    @Override
    public boolean isGroupNameExist(String groupName) {
        return !entityManager.createQuery(
                        "SELECT g FROM Group g WHERE g.name = :groupName", Group.class)
                .setParameter("groupName", groupName)
                .getResultList()
                .isEmpty();
    }
}
