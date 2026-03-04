package com.lkl.studygroup.service;

import com.lkl.studygroup.dto.request.*;
import com.lkl.studygroup.dto.response.*;
import com.lkl.studygroup.enums.ErrorCode;
import com.lkl.studygroup.exception.ExceptionResponse;
import com.lkl.studygroup.model.*;
import com.lkl.studygroup.model.enums.MemberStatus;
import com.lkl.studygroup.repository.ForgotPasswordRepository;
import com.lkl.studygroup.repository.GroupMemberRepository;
import com.lkl.studygroup.repository.GroupRepository;
import com.lkl.studygroup.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.UUID;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private GroupRepository groupRepository;
    @Autowired
    private GroupMemberRepository groupMemberRepository;
    @Autowired
    private GroupService groupService;
    @Autowired
    private ForgotPasswordService forgotPasswordService;
    @Autowired
    private EmailService emailService;


    public User registerUser(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new ExceptionResponse(ErrorCode.USER_IS_ALREADY_EXISTED);
        } else {
            User user = new User();
            user.setEmail(registerRequest.getEmail());
            user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
            user.setInterests(registerRequest.getInterests());
            user.setFirstName(registerRequest.getFirstName());
            user.setLastName(registerRequest.getLastName());
            user.setIsDeactivated(false);
            userRepository.save(user);
            return user;
        }
    }

    public User getUserForOAuth(String email) {
        User user = userRepository.findByEmail(email);
        return user;
    }

    public User findByEmail (String email) {
        User user = getUserForOAuth(email);
        if (user == null) {
            throw new ExceptionResponse(ErrorCode.USER_NOT_FOUND);
        }
        return user;
    }

    public LoginResponse authenUser(LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail());
        if (user == null) {
            throw new ExceptionResponse(ErrorCode.USER_NOT_FOUND);
        }
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new ExceptionResponse(ErrorCode.INVALID_PASSWORD);
        }
        if (Boolean.TRUE.equals(user.getIsDeactivated())) {
            if (loginRequest.isReactive()) {
                user.setIsDeactivated(false);
                userRepository.save(user);
            } else {
                throw new ExceptionResponse(ErrorCode.ACCOUNT_IS_DEACTIVATED);
            }
        }
        String jwtTokenId = jwtService.generateJwtKeyId();
        user.setJwtTokenId(jwtTokenId);
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
        String token = jwtService.generateToken(user);
        return new LoginResponse(token, new UserProfileDto(user));
    }

    public String generateUserToken(User user) {
        String jwtTokenId = jwtService.generateJwtKeyId();
        user.setJwtTokenId(jwtTokenId);
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
        String token = jwtService.generateToken(user);
        return token;
    }

    public void logout(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new ExceptionResponse(ErrorCode.USER_NOT_FOUND);
        }
        user.setJwtTokenId(null);
        userRepository.save(user);
    }

    public UserProfileDto getUserByEmail(String email) {
        User user = userRepository.findByEmail(email);
        return new UserProfileDto(user);
    }

    public User updateUser(String email, UserUpdateRequest request) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("Not found");
        }
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }
        if (request.getInterests() != null) {
            user.setInterests(request.getInterests());
        }
        return userRepository.save(user);
    }

    public void saveTokenToUser(String email, String token) {
        User user = userRepository.findByEmail(email);
        if (user != null) {
            user.setJwtTokenId(token);
            user.setLastLoginAt(LocalDateTime.now());
            userRepository.save(user);
        }
    }

    public User getUserById(String id) {
        User user = userRepository.findUserById(id);
        return user;
    }

    public void changePassword(ChangePasswordRequest changePasswordRequest, UserPrincipal userPrincipal) {
        User user = getUserById(userPrincipal.getUserId().toString());
        if (!passwordEncoder.matches(changePasswordRequest.getOldPassword(), user.getPassword())) {
            throw new ExceptionResponse(ErrorCode.INVALID_PASSWORD);
        }
        user.setPassword(passwordEncoder.encode(changePasswordRequest.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    public void deleteAccount(DeleteAccountRequest deleteAccountRequest, UserPrincipal userPrincipal) {
        if (deleteAccountRequest.getConfirmDelete().equals("Please type DELETE MY ACCOUNT to confirm")) {
            groupMemberRepository.deleteByUserId(userPrincipal.getUserId());
            groupRepository.deleteByCreatedBy(userPrincipal.getUserId());
            userRepository.deleteById(userPrincipal.getUserId());
        }
    }

    public void deactivatedAccount(UserPrincipal userPrincipal) {
        User user = getUserById(userPrincipal.getUserId().toString());
        user.setIsDeactivated(true);
        userRepository.save(user);
    }

    public ListInvitation getListInvitation (UUID userId, String keyword, Integer pageNumber, Integer pageSize) {
        Pageable pageDetails = PageRequest.of(pageNumber - 1, pageSize, Sort.by(Sort.Order.desc("createdAt")).descending());
        Page<Group> groups = groupService.getGroupMembersByUserIdAndStatus(userId, MemberStatus.PENDING, keyword, pageDetails);
        List<Invitation> invitations = groups.getContent().stream().map(
                group -> new Invitation(
                        group.getId().toString(),
                        group.getName()
                )
        ).toList();
        ListInvitation listInvitation = new ListInvitation(invitations, groups.getTotalElements());
        return listInvitation;
    }

    public String radomVerifyCode () {
        String characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        Random random = new Random();
        StringBuilder sb = new StringBuilder();
        for(int i = 0; i < 5; i++) {
            int index = random.nextInt(characters.length());
            sb.append(characters.charAt(index));
        }
        return sb.toString();
    }

    public void forgotPassword (User user) {
        ForgotPassword forgotPassword = forgotPasswordService.findById(user.getId());
        if(forgotPassword == null){
            forgotPassword = new ForgotPassword();
            forgotPassword.setUser(user);
        }else{
            forgotPassword.setExpiryDate(LocalDateTime.now().plusMinutes(5));
        }
        forgotPassword.setCode(radomVerifyCode());
        forgotPasswordService.save(forgotPassword);
        sendEmailForgotPassword(user, forgotPassword);
    }

    public void sendEmailForgotPassword (User user, ForgotPassword forgotPassword) {
        String subject = "Recent changes to your StudyGroup account";
        String template = "Hello, "+user.getFirstName()+"!\n\n"
                + "Please reset your password using the following confirmation code. This code will expire after 5 minutes \n\n"
                + forgotPassword.getCode()+"\n\n"
                + "Best regards,\n"
                + "The StudyGroup Team";
        emailService.sendEmail(user.getEmail(), subject, template);
    }

    public void forgotPasswordChange (ForgotPasswordChangeRequest forgotPasswordChangeRequest) {
        User user = findByEmail(forgotPasswordChangeRequest.getEmail());
        ForgotPassword forgotPassword = forgotPasswordService.findById(user.getId());
        if(forgotPassword == null){
            throw new ExceptionResponse(ErrorCode.USER_DOES_NOT_CHANGE_PASSWORD);
        }
        if (LocalDateTime.now().isAfter(forgotPassword.getExpiryDate())) {
            throw new ExceptionResponse(ErrorCode.CODE_IS_EXPIRED);
        }
        if(!forgotPassword.getCode().equals(forgotPasswordChangeRequest.getCode())){
            throw new ExceptionResponse(ErrorCode.CODE_IS_WRONG);
        }
        if(!forgotPasswordChangeRequest.getNewPassword().equals(forgotPasswordChangeRequest.getConfirmNewPassword())){
            throw new ExceptionResponse(ErrorCode.PASSWORD_IS_NOT_MATCH);
        }
        user.setPassword(passwordEncoder.encode(forgotPasswordChangeRequest.getNewPassword()));
        userRepository.save(user);
        forgotPasswordService.delete(forgotPassword);
    }

    public GetListUserWithTotalResponse getAllUsers(String keyword, Integer pageNumber, Integer pageSize) {
        Pageable pageable = PageRequest.of(pageNumber - 1, pageSize, Sort.by("createdAt").descending());
        Page<User> result;
        if (keyword != null && !keyword.isBlank()) {
            result = userRepository.findAllByEmailContainingIgnoreCaseOrFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(keyword, keyword, keyword, pageable);
        } else {
            result = userRepository.findAll(pageable);
        }
        
        List<UserProfileDto> users = result.getContent().stream()
                .map(UserProfileDto::new)
                .collect(java.util.stream.Collectors.toList());
                
        return new GetListUserWithTotalResponse(users, result.getTotalElements());
    }

    public void banUser(UUID userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ExceptionResponse(ErrorCode.USER_NOT_FOUND));
        user.setIsDeactivated(true);
        userRepository.save(user);
    }

    @Transactional
    public void deleteUserAdmin(UUID userId) {
        groupMemberRepository.deleteByUserId(userId);
        groupRepository.deleteByCreatedBy(userId);
        userRepository.deleteById(userId);
    }

    public void updateUserStatus(String userId, String status) {
        User user = userRepository.findUserById(userId);
        if (user == null) throw new ExceptionResponse(ErrorCode.USER_NOT_FOUND);
        
        if ("ACTIVE".equalsIgnoreCase(status) || "APPROVED".equalsIgnoreCase(status)) {
            user.setIsDeactivated(false);
        } else if ("DEACTIVATED".equalsIgnoreCase(status) || "PENDING".equalsIgnoreCase(status) || "BANNED".equalsIgnoreCase(status)) {
            user.setIsDeactivated(true);
        }
        userRepository.save(user);
    }
}
