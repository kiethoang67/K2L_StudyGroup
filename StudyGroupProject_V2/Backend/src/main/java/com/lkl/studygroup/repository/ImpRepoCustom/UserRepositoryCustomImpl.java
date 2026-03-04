package com.lkl.studygroup.repository.ImpRepoCustom;

import com.lkl.studygroup.model.User;
import com.lkl.studygroup.repository.UserRepositoryCustom;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.util.List;
import java.util.UUID;

public class UserRepositoryCustomImpl implements UserRepositoryCustom {
    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public User findUserById (String userId) {
        return entityManager.createQuery(
                        "SELECT u FROM User u WHERE u.id = :id",
                        User.class
                )
                .setParameter("id", UUID.fromString(userId))
                .getSingleResult();
    }

    @Override
    public List<User> searchUsers(String keyword) {
        return entityManager.createQuery(
                        "SELECT u FROM User u WHERE LOWER(u.email) LIKE :keyword OR LOWER(u.firstName) LIKE :keyword Or LOWER(u.lastName) LIKE :keyword",
                        User.class
                )
                .setParameter("keyword", "%" + keyword.toLowerCase() + "%")
                .getResultList();
    }

    @Override
    public List<User> findUsersByIds(List<String> ids) {
        List<UUID> uuidIds = ids.stream()
                .map(UUID::fromString)
                .collect(java.util.stream.Collectors.toList());
        return entityManager.createQuery(
                        "SELECT u FROM User u WHERE u.id in (:ids) ",
                        User.class
                )
                .setParameter("ids", uuidIds)
                .getResultList();
    }
}
