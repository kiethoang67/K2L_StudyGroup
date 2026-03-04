package com.lkl.studygroup.model.mongo;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Document(collection = "message")
public class Message {
    @Id
    private String id;
    private String messageType;
    private String chatId;
    private String content;
    private Instant createdAt =  Instant.now();
    private String receiverId;
    private String senderId;
    private boolean isGroupMessage;
}
