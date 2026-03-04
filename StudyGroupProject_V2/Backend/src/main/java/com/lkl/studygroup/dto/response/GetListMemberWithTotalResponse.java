package com.lkl.studygroup.dto.response;

import lombok.Data;

import java.util.List;


@Data
public class GetListMemberWithTotalResponse {
    List<GetMemberResponse> members;
    long totalMembers;

    public GetListMemberWithTotalResponse(List<GetMemberResponse> members, long totalMembers) {
        this.members = members;
        this.totalMembers = totalMembers;
    }
}
