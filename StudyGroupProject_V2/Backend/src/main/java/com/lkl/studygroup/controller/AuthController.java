package com.lkl.studygroup.controller;

import com.lkl.studygroup.common.ApiResponse;
import com.lkl.studygroup.dto.request.LoginRequest;
import com.lkl.studygroup.dto.request.RegisterRequest;
import com.lkl.studygroup.dto.response.LoginResponse;
import com.lkl.studygroup.dto.response.ResponseGeneral;
import com.lkl.studygroup.dto.response.Url;
import com.lkl.studygroup.exception.ExceptionResponse;
import com.lkl.studygroup.model.User;
import com.lkl.studygroup.model.UserPrincipal;
import com.lkl.studygroup.service.JwtService;
import com.lkl.studygroup.service.MeetingService;
import com.lkl.studygroup.service.UserService;
import jakarta.validation.Valid;
import org.apache.catalina.connector.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private UserService userService;
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private MeetingService meetingService;

    @PostMapping("register")
    public ApiResponse<Void> register(@Valid @RequestBody RegisterRequest registerRequest) {
        userService.registerUser(registerRequest);
        UUID uuid = UUID.randomUUID();
        System.out.println("Meeting Id:"+meetingService.generateMeetingId(uuid, LocalDateTime.now(), LocalDateTime.now().plusMinutes(30),"learningJava"));
        return ApiResponse.success(null,"Register Success",null);
    }

    @PostMapping("login")
    public ApiResponse<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        LoginResponse loginResponse = userService.authenUser( loginRequest);
        return ApiResponse.success(loginResponse,"Login Success",null);
    }

    @PostMapping("logout")
    public ApiResponse<Void> logout (@AuthenticationPrincipal UserPrincipal principal) {
        System.out.println("Pass:"+principal.getPassword());
        String email = principal.getEmail();
        userService.logout(email);
        return ApiResponse.success(null,"logout success",null);
    }

//    @GetMapping("login/google")
//    public ApiResponse<Url> loginByGoogle() {
//        Url url = new Url("https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=http://localhost:8081/api/auth/oauth2/callback/google&response_type=code&client_id=870197791443-f7huidsgj5mdtfpr364h4bkd5ppedk0r.apps.googleusercontent.com&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile+openid&access_type=offline");
//        return ApiResponse.success(url,"Login Success",null);
////        https://accounts.google.com/o/oauth2/v2/auth
////        ?response_type=code
////                &client_id=xxx
////                &scope=openid%20email%20profile
////                &redirect_uri=http://localhost:8080/login/oauth2/code/google
////  &state=abc123
////                &nonce=xyz
//    }
//    @GetMapping("oauth2/callback/google")
//    public void oauth2GoogleCallback(@RequestParam String code, @RequestParam String state) {
//        System.out.println("code:"+code);
//        System.out.println("state"+state);
//    }

}
