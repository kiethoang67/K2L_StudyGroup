package com.lkl.studygroup.service;

import com.lkl.studygroup.dto.request.CreateCommentRequest;
import com.lkl.studygroup.dto.response.CreateCommentResponse;
import com.lkl.studygroup.dto.response.CreatorInfo;
import com.lkl.studygroup.dto.response.GetListCommentsWithTotalResponse;
import com.lkl.studygroup.dto.response.ListCommentsResponse;
import com.lkl.studygroup.model.Comment;
import com.lkl.studygroup.model.User;
import com.lkl.studygroup.repository.CommentRepository;
import com.lkl.studygroup.repository.UserRepository;
import com.lkl.studygroup.specification.CommentSpecs;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class CommentService {
    @Autowired
    private CommentRepository commentRepository;
    @Autowired
    private UserRepository userRepository;

    public CreateCommentResponse createComment(CreateCommentRequest createCommentRequest, UUID sectionId, UUID userId) {
        Comment comment = new Comment();
        comment.setSectionId(sectionId);
        comment.setCreatorId(userId);
        comment.setContent(createCommentRequest.getContent());
        commentRepository.save(comment);
        User creator = userRepository.findUserById(userId.toString());
        CreatorInfo creatorInfo = new CreatorInfo(userId.toString(), creator.getEmail(), creator.getAvatarUrl(), creator.getLastName(), creator.getFirstName());
        CreateCommentResponse createCommentResponse = new CreateCommentResponse(comment.getId().toString(), comment.getContent(), creatorInfo);
        return createCommentResponse;
    }

    public GetListCommentsWithTotalResponse getListComments(UUID sectionId, Integer pageNumber, Integer pageSize,
                                                String sortBy, String sortOrder) {
        Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageDetails = PageRequest.of(pageNumber - 1, pageSize, sortByAndOrder);

        Specification<Comment> spec = Specification.allOf(
                CommentSpecs.inSection(sectionId)
        );

        Page<ListCommentsResponse> result = commentRepository.findAll(spec, pageDetails)
                .map(comment -> new ListCommentsResponse(
                        comment.getId().toString(),
                        comment.getContent(),
                        new CreatorInfo(
                                comment.getCreator().getId().toString(),
                                comment.getCreator().getEmail(),
                                comment.getCreator().getAvatarUrl(),
                                comment.getCreator().getLastName(),
                                comment.getCreator().getFirstName()
                        )
                ));

        return new GetListCommentsWithTotalResponse(result.getContent(), result.getTotalElements());
    }

    public Page<ListCommentsResponse> getListThreeLastestComments(UUID sectionId) {
        Page<ListCommentsResponse> listTopComments = commentRepository.findBySectionId(sectionId, PageRequest.of(0, 3))
                .map(comment -> new ListCommentsResponse(
                        comment.getId().toString(),
                        comment.getContent(),
                        new CreatorInfo(
                                comment.getCreator().getId().toString(),
                                comment.getCreator().getEmail(),
                                comment.getCreator().getAvatarUrl(),
                                comment.getCreator().getLastName(),
                                comment.getCreator().getFirstName()
                        )
                ));
        return listTopComments;
    }
}

