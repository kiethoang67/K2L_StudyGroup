package com.lkl.studygroup.service;

import com.lkl.studygroup.model.ForgotPassword;
import com.lkl.studygroup.repository.ForgotPasswordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class ForgotPasswordService {
    @Autowired
    private ForgotPasswordRepository forgotPasswordRepository;

    public ForgotPassword findById(UUID id) {
        ForgotPassword forgotPassword = forgotPasswordRepository.findById(id).orElse(null);
        return forgotPassword;
    }
    public void save(ForgotPassword forgotPassword) {
        forgotPasswordRepository.save(forgotPassword);
    }
    public void delete(ForgotPassword forgotPassword) {
        forgotPasswordRepository.delete(forgotPassword);
    }
}
