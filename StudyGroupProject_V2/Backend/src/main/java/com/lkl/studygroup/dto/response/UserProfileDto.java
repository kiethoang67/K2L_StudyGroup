package com.lkl.studygroup.dto.response;

import com.lkl.studygroup.model.User;
import com.lkl.studygroup.model.enums.UserStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
@Getter
@Setter
public class UserProfileDto {
    private UUID id;
    private String email;
    private String firstName;
    private String lastName;
    private String avatarUrl;
    private List<String> interests;
    private UserStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean isAdmin;
    private Boolean isDeactivated;
    public UserProfileDto(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.avatarUrl = user.getAvatarUrl();
        this.interests = user.getInterests();
        this.status = user.getStatus();
        this.createdAt = user.getCreatedAt();
        this.updatedAt = user.getUpdatedAt();
        this.isAdmin = user.getIsAdmin();
        this.isDeactivated = user.getIsDeactivated();
    }
}
