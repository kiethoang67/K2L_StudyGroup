package com.lkl.studygroup.common.aspect;

import com.lkl.studygroup.common.annotation.RequireGroupAdmin;
import com.lkl.studygroup.enums.ErrorCode;
import com.lkl.studygroup.exception.ExceptionResponse;
import com.lkl.studygroup.model.UserPrincipal;
import com.lkl.studygroup.model.enums.GroupRole;
import com.lkl.studygroup.repository.GroupMemberRepository;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Aspect
@Component
@RequiredArgsConstructor
public class GroupRoleAspect {

    private final GroupMemberRepository groupMemberRepository;

    @Before("@annotation(requireGroupAdmin)")
    public void checkGroupAdmin(
            JoinPoint joinPoint,
            RequireGroupAdmin requireGroupAdmin
    ) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();

        // If system admin, bypass group-level check
        if (principal.isAdmin()) {
            return;
        }

        UUID groupId = extractGroupId(joinPoint, requireGroupAdmin);
        UUID userId = principal.getUserId();
        System.out.println("id group" + groupId);
        System.out.println("id user" + userId);
        boolean isGroupAdmin = groupMemberRepository
                .existsByGroupIdAndUserIdAndRole(
                        groupId,
                        userId
                );
        System.out.println("isGroupAdmin" + isGroupAdmin);
        if (!isGroupAdmin) {
            throw new ExceptionResponse(ErrorCode.IS_NOT_ADMIN);
        }
    }

    private UUID extractGroupId(
            JoinPoint joinPoint,
            RequireGroupAdmin annotation
    ) {
        MethodSignature signature =
                (MethodSignature) joinPoint.getSignature();

        String[] paramNames = signature.getParameterNames();
        Object[] args = joinPoint.getArgs();

        for (int i = 0; i < paramNames.length; i++) {
            if (paramNames[i].equals(annotation.groupIdParam())) {
                return (UUID) args[i];
            }
        }

        throw new IllegalStateException("groupId param not found");
    }

}
