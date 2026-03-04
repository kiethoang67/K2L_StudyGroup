package com.lkl.studygroup.exception;

import com.lkl.studygroup.enums.ErrorCode;
import lombok.*;
@Getter
@Setter
public class ExceptionResponse extends RuntimeException {

    private final ErrorCode errorCode;

    public ExceptionResponse (ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

}
