package com.lkl.studygroup.model.embedded;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.UUID;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class GroupMemberId implements Serializable {

    @Column(name = "user_id", columnDefinition = "UUID")
    private UUID userId;

    @Column(name = "group_id", columnDefinition = "UUID")
    private UUID groupId;
}

