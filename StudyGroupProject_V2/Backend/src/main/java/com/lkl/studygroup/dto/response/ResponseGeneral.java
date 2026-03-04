package com.lkl.studygroup.dto.response;

public class ResponseGeneral<T> {

    private boolean success;
    private String message;
    private T data;
    private Object meta;

    public ResponseGeneral(boolean success, String message, Object meta, T data) {
        this.success = success;
        this.message = message;
        this.meta = meta;
        this.data = data;
    }

    public boolean isSuccess() {
        return success;
    }

    public String getMessage() {
        return message;
    }

    public T getData() {
        return data;
    }

    public Object getMeta() {
        return meta;
    }
}
