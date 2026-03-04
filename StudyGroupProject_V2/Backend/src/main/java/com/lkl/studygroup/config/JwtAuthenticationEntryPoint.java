package com.lkl.studygroup.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lkl.studygroup.common.ApiResponse;
import com.lkl.studygroup.enums.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException
    ) throws IOException {
        ErrorCode errorCode =
                (ErrorCode) request.getAttribute("jwt_error");

        if (errorCode == null) {
            errorCode = ErrorCode.UNAUTHORIZED;
        }
        response.setStatus(errorCode.getStatus().value());
        response.setContentType("application/json");
        System.out.println(authException.getMessage());

        ApiResponse<?> body = ApiResponse.error(
                errorCode.getMessage()
        );

        ObjectMapper mapper = new ObjectMapper();
        response.getWriter().write(mapper.writeValueAsString(body));
    }
}
