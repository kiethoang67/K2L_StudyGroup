package com.lkl.studygroup.repository;

import com.lkl.studygroup.model.Meeting;
import com.lkl.studygroup.model.enums.MeetingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
@Repository
public interface MeetingRepository extends JpaRepository<Meeting, UUID> {
    @Query("Select m From Meeting m where m.groupId = :groupId And m.endedAt > :currentTime")
    Page<Meeting> getListMeetingByGroupIdAndStatus(@Param("groupId") UUID groupId, Pageable pageable,@Param("currentTime") LocalDateTime currentTime);
    @Query("Select m from Meeting m where m.groupId IN :groupIds and m.endedAt > :currentTime")
    Page<Meeting> getListMeetingByUserIdAndStatus(
            @Param("groupIds") List<UUID> groupIds,
            Pageable pageable,
            @Param("currentTime") LocalDateTime currentTime
    );
}
