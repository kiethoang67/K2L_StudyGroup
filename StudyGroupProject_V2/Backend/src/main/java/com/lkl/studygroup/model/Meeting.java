package com.lkl.studygroup.model;


import com.lkl.studygroup.model.enums.MeetingStatus;
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
@Table(name = "meetings")
public class Meeting {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "UUID")
    private UUID id;

    @Column(name = "group_id", columnDefinition = "UUID", nullable = false)
    private UUID groupId;

    @Column(name = "host_user_id", columnDefinition = "UUID", nullable = false)
    private UUID hostUserId;

    @Column(name = "meeting_room_id", length = 64)
    private String meetingRoomId;

    @Column(length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Meeting thuộc về 1 Group
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", insertable = false, updatable = false)
    private Group group;

    // Meeting được host bởi 1 User
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "host_user_id", insertable = false, updatable = false)
    private User host;
}
