package com.lkl.studygroup.repository;

import com.lkl.studygroup.model.User;

import java.util.List;
import java.util.UUID;

public interface UserRepositoryCustom {
    User findUserById (String userId);
    List<User> searchUsers (String keyword);
    List<User> findUsersByIds (List<String> id);
}
