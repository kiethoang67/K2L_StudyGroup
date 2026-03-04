package com.lkl.studygroup.model;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "groups")
public class Group {
    @Id
    @GeneratedValue
    @Column(columnDefinition = "UUID")
    private UUID id;
    @Column(nullable = false, length = 255)
    private String name;
    @Column(columnDefinition = "TEXT")
    private String description;
    @Column(name = "is_public")
    private Boolean isPublic;
    @Column(name = "banner_url", columnDefinition = "TEXT")
    private String bannerUrl;
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<String> tags;
    @Column(name = "created_by", columnDefinition = "UUID")
    private UUID createdBy;
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    // 1 user có thể tạo nhiều group
    @ManyToOne(fetch = FetchType.LAZY, cascade=CascadeType.ALL)
    @JoinColumn(name = "created_by", insertable = false, updatable = false)
    private User creator;
    // 1 group thì có nhiều member
    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL)
    private List<GroupMember> members;
}