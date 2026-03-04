package com.lkl.studygroup.model;

import com.lkl.studygroup.model.enums.UserStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Setter
@Getter
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue
    @Column(columnDefinition = "UUID")
    private UUID id;
    @Column(nullable = false, unique = true, length = 255)
    private String email;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String password;
    @Column(name = "first_name", length = 255)
    private String firstName;
    @Column(name = "last_name", length = 255)
    private String lastName;
    @Column(name = "avatar_url", columnDefinition = "TEXT")
    private String avatarUrl;
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<String> interests;
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private UserStatus status;
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;
    @Column(name = "jwt_token_id", length = 255)
    private String jwtTokenId;
    @Column(name = "is_deactivated")
    private Boolean isDeactivated = false;
    @Column(name = "is_admin")
    private Boolean isAdmin = false;
    // 1 user có nhiều group memberships
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GroupMember> groupMemberships;
}
