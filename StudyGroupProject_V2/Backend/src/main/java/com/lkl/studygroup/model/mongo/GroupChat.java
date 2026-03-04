package com.lkl.studygroup.model.mongo;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Document(collection = "groupchat")
public class GroupChat {

    @Id
    private String id;
    private String groupId;
    private Instant createdAt = Instant.now();

    public GroupChat(String groupId) {
        this.groupId = groupId;
    }

    // Getters and setters
}