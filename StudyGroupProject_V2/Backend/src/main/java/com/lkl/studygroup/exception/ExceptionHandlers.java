package com.lkl.studygroup.exception;

import com.lkl.studygroup.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ExceptionHandlers {
  @ExceptionHandler(ExceptionResponse.class)
  public ResponseEntity<ApiResponse<?>> handleApiException(ExceptionResponse ex) {
    return ResponseEntity
        .status(ex.getErrorCode().getStatus())
        .body(ApiResponse.error(ex.getMessage()));
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ApiResponse<?>> handleUnknownException(Exception ex) {
    System.err.println("[UNHANDLED EXCEPTION] " + ex.getClass().getName() + ": " + ex.getMessage());
    ex.printStackTrace();
    return ResponseEntity
        .internalServerError()
        .body(ApiResponse.error("Internal Server Error: " + ex.getMessage()));
  }
}
