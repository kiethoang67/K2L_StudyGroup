package com.lkl.studygroup.common;

import com.lkl.studygroup.dto.response.ListNotificationWithTotalResponse;
import lombok.*;

@Getter
@AllArgsConstructor
public class ApiResponse<T> {

    private boolean success;
    private T data;
    private String message;
    private Object metadata;

    public static <T> ApiResponse<T> success(T data, String message, Object metadata) {
        return new ApiResponse<>(true, data, message, metadata);
    }

    public static ApiResponse<?> error(String message) {
        return new ApiResponse<>(false, null, message, null);
    }

    public static ApiResponse<ListNotificationWithTotalResponse> success(ListNotificationWithTotalResponse listNotification) {
        return null;
    }
}