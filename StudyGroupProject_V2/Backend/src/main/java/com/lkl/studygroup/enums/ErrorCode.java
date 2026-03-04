package com.lkl.studygroup.enums;

import org.springframework.http.HttpStatus;

public enum ErrorCode {

    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "User not found"),
    INVALID_CREDENTIAL(HttpStatus.BAD_REQUEST, "Invalid credential"),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "Unauthorized"),
    USER_IS_ALREADY_EXISTED(HttpStatus.BAD_REQUEST, "User is already existed"),
    INVALID_PASSWORD(HttpStatus.BAD_REQUEST,"Invalid password"),
    JWT_EXPIRED(HttpStatus.UNAUTHORIZED, "JWT token is expired"),
    JWT_INVALID_SIGNATURE(HttpStatus.UNAUTHORIZED, "Invalid JWT signature"),
    JWT_UNSUPPORTED(HttpStatus.UNAUTHORIZED, "Unsupported JWT token"),
    JWT_MALFORMED(HttpStatus.UNAUTHORIZED, "Malformed JWT token"),
    JWT_EMPTY_CLAIMS(HttpStatus.UNAUTHORIZED, "JWT claims string is empty"),
    JWT_TOKEN_ID_INVALID(HttpStatus.UNAUTHORIZED, "Jwt token id is invalid"),
    GROUP_NOT_FOUND(HttpStatus.NOT_FOUND, "Group not found"),
    GROUP_NAME_IS_EXIST(HttpStatus.BAD_REQUEST, "Group name is exist"),
    IS_NOT_ADMIN(HttpStatus.FORBIDDEN,"User is not admin of this group"),
    USER_NOT_IN_GROUP(HttpStatus.BAD_REQUEST,"User is not in this group"),
    ACCOUNT_IS_DEACTIVATED(HttpStatus.BAD_REQUEST,"This account is deactivated"),
    DIRECT_CHAT_NOT_FOUND(HttpStatus.BAD_REQUEST,"DirectChat not found"),
    DIRECT_CHAT_ALREADY_EXISTS(HttpStatus.CONFLICT, "Direct chat already exists with this user"),
    SECTION_NOT_FOUND(HttpStatus.NOT_FOUND, "Section not found"),
    USER_IS_NOT_CREATOR(HttpStatus.FORBIDDEN,"User is not creator"),
    USER_DOES_NOT_CHANGE_PASSWORD(HttpStatus.BAD_REQUEST,"User does not change password"),
    CODE_IS_EXPIRED(HttpStatus.BAD_REQUEST,"Code is expired"),
    CODE_IS_WRONG(HttpStatus.BAD_REQUEST,"Code is wrong"),
    PASSWORD_IS_NOT_MATCH(HttpStatus.BAD_REQUEST,"Password is not match"),;

    private final HttpStatus status;
    private final String message;

    ErrorCode(HttpStatus status, String message) {
        this.status = status;
        this.message = message;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getMessage() {
        return message;
    }
}
