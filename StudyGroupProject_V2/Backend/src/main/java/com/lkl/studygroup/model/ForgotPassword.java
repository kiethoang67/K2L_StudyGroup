package com.lkl.studygroup.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;
@Setter
@Getter
@Entity
public class ForgotPassword {

    @Id
    private UUID id;

    private LocalDateTime expiryDate;

    private String code;

    @OneToOne
    @MapsId
    @JoinColumn(name = "id")
    private User user;
    @PrePersist
    public void beforeInsert() {
        this.expiryDate = LocalDateTime.now().plusMinutes(5);
    }
}
