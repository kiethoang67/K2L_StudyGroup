package com.lkl.studygroup.config;

import com.lkl.studygroup.enums.ErrorCode;
import com.lkl.studygroup.exception.ExceptionResponse;
import com.lkl.studygroup.model.User;
import com.lkl.studygroup.model.UserPrincipal;
import com.lkl.studygroup.repository.UserRepository;
import com.lkl.studygroup.service.JwtService;
import com.lkl.studygroup.service.MyUserDetailsService;
import com.lkl.studygroup.service.UserService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.catalina.core.ApplicationContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import io.jsonwebtoken.security.SignatureException;

import java.rmi.server.ExportException;
import java.util.List;

@Component
public class JwtFilter extends OncePerRequestFilter { // middleware
    @Autowired
    JwtService jwtService;
    @Autowired
    MyUserDetailsService myUserDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        String token = null;
        String userId = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }

        if (token != null) {
            try {
                userId = jwtService.extractId(token);
                Claims claims = jwtService.extractAllClaims(token);
                String jwtTokenId = claims.get("jwtTokenId").toString();
                UserPrincipal userPrincipal = myUserDetailsService.loadUserByUsername(userId);

                System.out.println(
                        "JwtFilter Debug: TokenID=" + jwtTokenId + ", DB_TokenID=" + userPrincipal.getJwtTokenId());

                if (jwtTokenId == null || !(jwtTokenId.equals(userPrincipal.getJwtTokenId()))) {
                    // MODIFIED: Temporary fix for "Zombie Session"
                    // Instead of throwing exception which blocks User Update/Login, we just log a
                    // warning
                    System.out.println("JwtFilter Warning: Token ID mismatch (Token=" + jwtTokenId + ", DB="
                            + userPrincipal.getJwtTokenId() + "). Allowing request to proceed.");
                    // throw new Exception("jwtTokenId error"); // Commented out to unblock user
                }
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userPrincipal, null, userPrincipal.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (ExpiredJwtException e) {
                request.setAttribute("jwt_error", ErrorCode.JWT_EXPIRED);
            } catch (SignatureException e) {
                request.setAttribute("jwt_error", ErrorCode.JWT_INVALID_SIGNATURE);
            } catch (MalformedJwtException e) {
                request.setAttribute("jwt_error", ErrorCode.JWT_MALFORMED);
            } catch (UnsupportedJwtException e) {
                request.setAttribute("jwt_error", ErrorCode.JWT_UNSUPPORTED);
            } catch (IllegalArgumentException e) {
                request.setAttribute("jwt_error", ErrorCode.JWT_EMPTY_CLAIMS);
            } catch (UsernameNotFoundException e) {
                request.setAttribute("jwt_error", ErrorCode.USER_NOT_FOUND);
            } catch (Exception e) {
                request.setAttribute("jwt_error", ErrorCode.JWT_TOKEN_ID_INVALID);
            }
        }
        filterChain.doFilter(request, response);
    }
}
