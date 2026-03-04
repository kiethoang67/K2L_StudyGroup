package com.lkl.studygroup.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class GetListSectionsWithTotalResponse {
    private List<ListSectionsResponse> sections;
    private Long total;

    public GetListSectionsWithTotalResponse(List<ListSectionsResponse> sections, Long total) {
        this.sections = sections;
        this.total = total;
    }
}
