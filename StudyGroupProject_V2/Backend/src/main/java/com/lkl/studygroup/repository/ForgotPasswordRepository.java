package com.lkl.studygroup.repository;

import com.lkl.studygroup.model.ForgotPassword;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ForgotPasswordRepository extends JpaRepository<ForgotPassword, UUID> {
}
