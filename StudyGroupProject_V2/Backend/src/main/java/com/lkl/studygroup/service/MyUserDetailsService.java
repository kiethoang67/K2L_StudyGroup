package com.lkl.studygroup.service;

import com.lkl.studygroup.model.User;
import com.lkl.studygroup.model.UserPrincipal;
import com.lkl.studygroup.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class MyUserDetailsService implements UserDetailsService {
    @Autowired
    private UserRepository userRepository;

    @Override
    public UserPrincipal loadUserByUsername(String userId) throws UsernameNotFoundException {
        System.out.println("Key "+ userId);
        User user = userRepository.findUserById(userId);
        if (user == null) {
            throw new UsernameNotFoundException("User not found");
        }
        return new UserPrincipal(user);
    }
}
