package com.lkl.studygroup.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class GetListCommentsWithTotalResponse {
    private List<ListCommentsResponse> comments;
    private Long total;

    public GetListCommentsWithTotalResponse(List<ListCommentsResponse> comments, Long total) {
        this.comments = comments;
        this.total = total;
    }
}
