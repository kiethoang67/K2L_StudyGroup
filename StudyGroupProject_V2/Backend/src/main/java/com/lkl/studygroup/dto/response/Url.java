package com.lkl.studygroup.dto.response;

import lombok.Data;

@Data
public class Url {
    String url;

    public Url(String url) {
        this.url = url;
    }
}
