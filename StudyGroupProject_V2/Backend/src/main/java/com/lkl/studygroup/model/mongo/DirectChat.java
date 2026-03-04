package com.lkl.studygroup.model.mongo;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Data
@Document(collection = "directchat")
public class DirectChat {

    @Id
    private String id;
    private List<String> participantIds;
    private Instant lastMessageAt;
    private Instant createdAt = Instant.now();

    // Getters and setters
}
