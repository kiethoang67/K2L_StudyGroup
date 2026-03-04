package com.lkl.studygroup.config;

import com.lkl.studygroup.dto.request.RegisterRequest;
import com.lkl.studygroup.dto.response.UserProfileDto;
import com.lkl.studygroup.model.User;
import com.lkl.studygroup.service.JwtService;
import com.lkl.studygroup.service.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RequestBody;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {
    final String defaultPassword = "123456";
    final List<String> defaultInterests = new ArrayList<>(List.of("Programming","Software Engineering"));

    @Autowired
    private UserService userService;
    @Autowired
    private JwtService jwtService;
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String firstName = oAuth2User.getAttribute("given_name");
        String lastName = oAuth2User.getAttribute("family_name");
        System.out.println("email: " + email);
        System.out.println("firstName: " + firstName);
        System.out.println("lastName: " + lastName);
        User user = userService.getUserForOAuth(email);
        if (user == null) {
            RegisterRequest registerRequest = new RegisterRequest();
            registerRequest.setFirstName(firstName);
            registerRequest.setLastName(lastName);
            registerRequest.setEmail(email);
            registerRequest.setPassword(defaultPassword);
            registerRequest.setInterests(defaultInterests);
            user = userService.registerUser(registerRequest);
        }
        String token = userService.generateUserToken(user);
        response.sendRedirect(
                "http://localhost:3000/oauth2/success?token=" + token
        );
    }
}
