package com.lkl.studygroup.model;

import com.lkl.studygroup.model.embedded.GroupMemberId;
import com.lkl.studygroup.model.enums.GroupRole;
import com.lkl.studygroup.model.enums.MemberStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "group_members")
public class GroupMember {
    @EmbeddedId
    private GroupMemberId id;
    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private GroupRole role;
    @Column(name = "is_active")
    private Boolean isActive;
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private MemberStatus status;
    // duoc add boi ai
    @Column(name = "created_by", columnDefinition = "UUID")
    private UUID createdBy;
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    // 1 group có nhiều member.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", insertable = false, updatable = false)
    private Group group;
    // 1 member có nhiều group.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;
}
