package com.lkl.studygroup.common.initializer;

import com.lkl.studygroup.model.User;
import com.lkl.studygroup.repository.UserRepository;
import com.lkl.studygroup.repository.GroupMemberRepository;
import com.lkl.studygroup.repository.GroupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.findByEmail("admin@gmail.com") == null) {
            User admin = new User();
            admin.setFirstName("System");
            admin.setLastName("Admin");
            admin.setEmail("admin@gmail.com");
            admin.setPassword(passwordEncoder.encode("123456"));
            admin.setIsAdmin(true);
            admin.setStatus(com.lkl.studygroup.model.enums.UserStatus.OFFLINE);
            userRepository.save(admin);
            System.out.println(">>> Default Admin Created: admin@studygroup.com / Admin123");
        }
    }
}
