package com.lkl.studygroup.service;

import com.lkl.studygroup.dto.request.CreateSectionRequest;
import com.lkl.studygroup.dto.request.EditSectionRequest;
import com.lkl.studygroup.dto.response.*;
import com.lkl.studygroup.enums.ErrorCode;
import com.lkl.studygroup.exception.ExceptionResponse;
import com.lkl.studygroup.model.Comment;
import com.lkl.studygroup.model.Group;
import com.lkl.studygroup.model.Section;
import com.lkl.studygroup.model.User;
import com.lkl.studygroup.model.enums.NotificationType;
import com.lkl.studygroup.model.mongo.Message;
import com.lkl.studygroup.repository.CommentRepository;
import com.lkl.studygroup.repository.GroupRepository;
import com.lkl.studygroup.repository.SectionRepository;
import com.lkl.studygroup.repository.UserRepository;
import com.lkl.studygroup.specification.SectionSpecs;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SectionService {
    @Autowired
    private SectionRepository sectionRepository;
    @Autowired
    private CommentService commentService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private NotificationService notificationService;

    public CreateSectionResponse createSection (UUID userId, Group group, CreateSectionRequest createSectionRequest) {
        Section section = new Section();
        section.setCreatorId(userId);
        section.setGroupId(group.getId());
        section.setAttachments(createSectionRequest.getAttachments());
        section.setContent(createSectionRequest.getContent());
        sectionRepository.save(section);
        User creator = userRepository.findUserById(userId.toString());
        CreatorInfo creatorInfo = new CreatorInfo(userId.toString(), creator.getEmail(), creator.getAvatarUrl(), creator.getLastName(), creator.getFirstName());
        CreateSectionResponse createSectionResponse = new CreateSectionResponse(section.getId().toString(),section.getAttachments(), section.getContent(),creatorInfo);
        notificationService.sendGroupNotification(group.getId().toString(),NotificationType.NEW_SECTION.getMessage()+" "+group.getName(), NotificationType.NEW_SECTION);
        return createSectionResponse;
    }

    public GetListSectionsWithTotalResponse getListSections (UUID groupId, String keyword, Integer pageNumber, Integer pageSize,
                                                 String sortBy, String sortOrder) {
        Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        
        Pageable pageDetails = PageRequest.of(pageNumber - 1, pageSize, sortByAndOrder);

        Specification<Section> spec = Specification.allOf(
                SectionSpecs.inGroup(groupId),
                SectionSpecs.keyword(keyword)
        );
        Page<ListSectionsResponse> result = sectionRepository
                .findAll(spec, pageDetails)
                .map(section -> {

                    Page<ListCommentsResponse> commentsPage =
                            commentService.getListThreeLastestComments(
                                    section.getId()
                            );

                    List<ListCommentsResponse> topComments = commentsPage.getContent();
                    long totalComment = commentsPage.getTotalElements();

                    return new ListSectionsResponse(
                        section.getId().toString(),
                        section.getContent(),
                        section.getAttachments(),
                        topComments,
                        totalComment,
                        new CreatorInfo(
                                section.getCreator().getId().toString(),
                                section.getCreator().getEmail(),
                                section.getCreator().getAvatarUrl(),
                                section.getCreator().getLastName(),
                                section.getCreator().getFirstName()
                        )
                    );
                });
        return new GetListSectionsWithTotalResponse(result.getContent(), result.getTotalElements());
    }

    public EditSectionResponse editSection (UUID userId, UUID sectionId, EditSectionRequest editSectionRequest) {
        Section section = sectionRepository.findSectionById(sectionId);
        if (section == null) {
            throw new ExceptionResponse(ErrorCode.SECTION_NOT_FOUND);
        }
        if(!section.getCreatorId().equals(userId)) {
            throw new ExceptionResponse(ErrorCode.USER_IS_NOT_CREATOR);
        }
        if(editSectionRequest.getContent() == null || editSectionRequest.getContent().isEmpty()) {
            section.setContent(editSectionRequest.getContent());
        }
        if(editSectionRequest.getAttachments() == null || editSectionRequest.getAttachments().isEmpty()) {
            section.setAttachments(editSectionRequest.getAttachments());
        }
        sectionRepository.save(section);
        return new  EditSectionResponse(section);
    }
}

