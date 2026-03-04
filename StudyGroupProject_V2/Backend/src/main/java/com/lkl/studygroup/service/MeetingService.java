package com.lkl.studygroup.service;

import com.lkl.studygroup.dto.request.CreateMeetingRequest;
import com.lkl.studygroup.dto.response.ListMeetingWithTotalResponse;
import com.lkl.studygroup.dto.response.MeetingResponse;
import com.lkl.studygroup.dto.response.CreatorInfo;
import com.lkl.studygroup.model.Group;
import com.lkl.studygroup.model.Meeting;
import com.lkl.studygroup.model.User;
import com.lkl.studygroup.model.enums.MeetingStatus;
import com.lkl.studygroup.model.enums.NotificationType;
import com.lkl.studygroup.repository.MeetingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Service
public class MeetingService {
    @Autowired
    private MeetingRepository meetingRepository;
    @Autowired
    private UserService userService;
    @Autowired
    private GroupService groupService;
    @Autowired
    private NotificationService notificationService;

    public String generateMeetingId (UUID groupId, LocalDateTime startedAt, LocalDateTime endedAt, String meetingTitle){
        try {

            String rawData = groupId.toString()
                    + startedAt.toString()
                    + endedAt.toString()
                    + meetingTitle;

            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawData.getBytes(StandardCharsets.UTF_8));

            String encoded = Base64.getUrlEncoder().withoutPadding().encodeToString(hash);

            return encoded.substring(0, 8);

        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error generating meeting ID", e);
        }
    }

    public MeetingResponse createMeeting(UUID groupId, UUID hostId, CreateMeetingRequest createMeetingRequest){
        Group group = groupService.findByGroupId(groupId);
        System.out.println("UUID");
        String meetingRoomId = generateMeetingId(groupId, createMeetingRequest.getStartedAt(), createMeetingRequest.getEndedAt(), createMeetingRequest.getTitle());
        Meeting meeting = new Meeting();
        meeting.setGroupId(groupId);
        meeting.setHostUserId(hostId);
        meeting.setStartedAt(createMeetingRequest.getStartedAt());
        meeting.setEndedAt(createMeetingRequest.getEndedAt());
        meeting.setDescription(createMeetingRequest.getDescription());
        meeting.setTitle(createMeetingRequest.getTitle());
        meeting.setMeetingRoomId(meetingRoomId);
        meetingRepository.save(meeting);
        User user = userService.getUserById(hostId.toString());
        CreatorInfo creatorInfo = new CreatorInfo(user.getId().toString(),user.getEmail(),user.getAvatarUrl(),user.getLastName(), user.getFirstName());
        MeetingResponse createMeetingResponse = new MeetingResponse(meeting.getId(),group.getId(),meeting.getMeetingRoomId(), meeting.getTitle(), meeting.getDescription(),MeetingStatus.SCHEDULED, meeting.getStartedAt(), meeting.getEndedAt(), creatorInfo, group.getName());
        notificationService.sendGroupNotification(groupId.toString(), NotificationType.NEW_MEETING.getMessage()+" "+group.getName(), NotificationType.NEW_MEETING);
        System.out.println("TypeNe"+NotificationType.NEW_MEETING);
        return createMeetingResponse;
    }

    public ListMeetingWithTotalResponse getListMeetingsByGroupId (UUID groupId, Integer pageNumber, Integer pageSize,
                                                         String sortBy, String sortOrder){
        LocalDateTime currentTime = LocalDateTime.now();
        Group group = groupService.findByGroupId(groupId);
        List<String> sort = List.of("startedAt", "endedAt");
        sortBy = sort.contains(sortBy) ? sortBy : "startedAt";
        Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageDetails = PageRequest.of(pageNumber - 1, pageSize, sortByAndOrder);
        Page<Meeting> meetings = meetingRepository.getListMeetingByGroupIdAndStatus(group.getId(), pageDetails, currentTime);
        List<MeetingResponse> meetingResponseList = meetings.stream().map(
                meeting -> {
                    MeetingStatus status = MeetingStatus.SCHEDULED;
                    if(currentTime.isAfter(meeting.getStartedAt()) && currentTime.isBefore(meeting.getEndedAt())){
                        status = MeetingStatus.LIVE;
                    }
                    return new MeetingResponse(
                            meeting.getId(),
                            meeting.getGroupId(),
                            meeting.getMeetingRoomId(),
                            meeting.getTitle(),
                            meeting.getDescription(),
                            status,
                            meeting.getStartedAt(),
                            meeting.getEndedAt(),
                            new CreatorInfo(
                                    meeting.getHost().getId().toString(),
                                    meeting.getHost().getEmail(),
                                    meeting.getHost().getAvatarUrl(),
                                    meeting.getHost().getLastName(),
                                    meeting.getHost().getFirstName()
                            ),
                            meeting.getGroup().getName()
                    );
                }
        ).toList();
        ListMeetingWithTotalResponse listMeetingWithTotalResponse = new ListMeetingWithTotalResponse(meetingResponseList, meetings.getTotalElements());
        return listMeetingWithTotalResponse;
    }

    public ListMeetingWithTotalResponse getListMeetingsbyUserId (UUID userId, Integer pageNumber, Integer pageSize,
                                                                  String sortBy, String sortOrder){
        LocalDateTime currentTime = LocalDateTime.now();
        List<String> sort = List.of("startedAt", "endedAt");
        sortBy = sort.contains(sortBy) ? sortBy : "startedAt";
        Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageDetails = PageRequest.of(pageNumber - 1, pageSize, sortByAndOrder);
        List<UUID> getListGroupIdsByUserId = groupService.getListGroupIdsByUserId(userId);
        Page<Meeting> meetings = meetingRepository.getListMeetingByUserIdAndStatus(getListGroupIdsByUserId, pageDetails, currentTime);
        List<MeetingResponse> meetingResponseList = meetings.stream().map(
                meeting -> {
                    MeetingStatus status = MeetingStatus.SCHEDULED;
                    if(currentTime.isAfter(meeting.getStartedAt()) && currentTime.isBefore(meeting.getEndedAt())){
                        status = MeetingStatus.LIVE;
                    }
                    return new MeetingResponse(
                            meeting.getId(),
                            meeting.getGroupId(),
                            meeting.getMeetingRoomId(),
                            meeting.getTitle(),
                            meeting.getDescription(),
                            status,
                            meeting.getStartedAt(),
                            meeting.getEndedAt(),
                            new CreatorInfo(
                                    meeting.getHost().getId().toString(),
                                    meeting.getHost().getEmail(),
                                    meeting.getHost().getAvatarUrl(),
                                    meeting.getHost().getLastName(),
                                    meeting.getHost().getFirstName()
                            ),
                            meeting.getGroup().getName()
                    );
                }
        ).toList();
        ListMeetingWithTotalResponse listMeetingWithTotalResponse = new ListMeetingWithTotalResponse(meetingResponseList, meetings.getTotalElements());
        return listMeetingWithTotalResponse;
    }
}
