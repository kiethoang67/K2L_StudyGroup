package com.lkl.studygroup.dto.response;

import com.lkl.studygroup.model.Group;
import lombok.Data;

import java.util.List;
@Data
public class ListInvitation {
    private List<Invitation> invitations;
    private long total;

    public ListInvitation(List<Invitation> invitations, long total) {
        this.invitations = invitations;
        this.total = total;
    }
}
