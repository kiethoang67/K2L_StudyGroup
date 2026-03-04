package com.lkl.studygroup.repository;
import com.lkl.studygroup.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;
public interface UserRepository extends JpaRepository<User, UUID>, UserRepositoryCustom {
    User findByEmail(String email);
    boolean existsByEmail(String email);
    User findUserById (String userId);
    List<User> searchUsers (String keyword);
    List<User> findUsersByIds (List<String> id);
    org.springframework.data.domain.Page<User> findAllByEmailContainingIgnoreCaseOrFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(String email, String firstName, String lastName, org.springframework.data.domain.Pageable pageable);
}
