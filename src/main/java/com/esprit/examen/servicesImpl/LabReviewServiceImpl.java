package com.esprit.examen.servicesImpl;

import com.esprit.examen.dto.CreateReviewRequest;
import com.esprit.examen.dto.LabRatingSummary;
import com.esprit.examen.dto.LabReviewResponse;
import com.esprit.examen.entities.Lab;
import com.esprit.examen.entities.LabReview;
import com.esprit.examen.entities.User;
import com.esprit.examen.exceptions.DuplicateResourceException;
import com.esprit.examen.exceptions.ResourceNotFoundException;
import com.esprit.examen.repositories.LabRepository;
import com.esprit.examen.repositories.LabReviewRepository;
import com.esprit.examen.repositories.UserRepository;
import com.esprit.examen.services.LabReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LabReviewServiceImpl implements LabReviewService {

    private final LabReviewRepository labReviewRepository;
    private final UserRepository userRepository;
    private final LabRepository labRepository;

    @Override
    @Transactional
    public LabReviewResponse createReview(Long userId, Long labId, CreateReviewRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        Lab lab = labRepository.findById(labId)
                .orElseThrow(() -> new ResourceNotFoundException("Lab not found: " + labId));

        if (labReviewRepository.existsByUserIdUserAndLabLabId(userId, labId)) {
            throw new DuplicateResourceException("User has already reviewed this lab");
        }

        LabReview review = LabReview.builder()
                .user(user)
                .lab(lab)
                .rating(request.rating())
                .comment(request.comment())
                .build();

        return toResponse(labReviewRepository.save(review));
    }

    @Override
    public List<LabReviewResponse> getReviewsByLab(Long labId) {
        return labReviewRepository.findByLabLabIdOrderByCreatedAtDesc(labId)
                .stream().map(this::toResponse).toList();
    }

    @Override
    public List<LabReviewResponse> getReviewsByUser(Long userId) {
        return labReviewRepository.findByUserIdUserOrderByCreatedAtDesc(userId)
                .stream().map(this::toResponse).toList();
    }

    @Override
    public LabRatingSummary getLabRatingSummary(Long labId) {
        Lab lab = labRepository.findById(labId)
                .orElseThrow(() -> new ResourceNotFoundException("Lab not found: " + labId));

        Double avg = labReviewRepository.getAverageRatingByLabId(labId);
        Long count = labReviewRepository.getReviewCountByLabId(labId);

        return new LabRatingSummary(
                lab.getLabId(),
                lab.getTitle(),
                avg != null ? Math.round(avg * 100.0) / 100.0 : 0.0,
                count != null ? count : 0L
        );
    }

    @Override
    @Transactional
    public LabReviewResponse updateReview(Long reviewId, CreateReviewRequest request) {
        LabReview review = labReviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found: " + reviewId));

        review.setRating(request.rating());
        review.setComment(request.comment());
        return toResponse(labReviewRepository.save(review));
    }

    @Override
    public void deleteReview(Long reviewId) {
        if (!labReviewRepository.existsById(reviewId)) {
            throw new ResourceNotFoundException("Review not found: " + reviewId);
        }
        labReviewRepository.deleteById(reviewId);
    }

    private LabReviewResponse toResponse(LabReview r) {
        return new LabReviewResponse(
                r.getReviewId(),
                r.getUser().getIdUser(),
                r.getUser().getNom(),
                r.getUser().getPrenom(),
                r.getLab().getLabId(),
                r.getLab().getTitle(),
                r.getRating(),
                r.getComment(),
                r.getCreatedAt(),
                r.getUpdatedAt()
        );
    }
}
