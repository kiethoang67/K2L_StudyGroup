package com.lkl.studygroup.dto.request;


import jakarta.validation.constraints.*;
import lombok.*;

import java.util.List;

@Getter
@Setter
public class RegisterRequest {
    @Email(message = "Email is invalid")
    @NotBlank(message = "Email shouldn't be null or empty")
    private String email;

    @NotBlank(message = "Password shouldn't be null or empty")
    @Size(min = 6, max = 20, message = "Password must be between 6 and 20 characters")
    private String password;

    @NotBlank(message = "First name shouldn't be null or empty")
    @Size(max = 50, message = "First name must not exceed 50 characters")
    private String firstName;

    @NotBlank(message = "Last name shouldn't be null or empty")
    @Size(max = 50, message = "Last name must not exceed 50 characters")
    private String lastName;

    @NotNull(message = "Interests shouldn't be null")
    @Size(min = 2, max = 10, message = "Interests must have between 2 and 10 items")
    private List<@NotBlank(message = "Interest must not be blank") String> interests;
}
