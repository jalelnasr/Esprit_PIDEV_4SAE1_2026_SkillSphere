package com.esprit.examen.services;

import com.esprit.examen.dto.CreateReviewRequest;
import com.esprit.examen.dto.LabRatingSummary;
import com.esprit.examen.dto.LabReviewResponse;

import java.util.List;

public interface LabReviewService {

    LabReviewResponse createReview(Long userId, Long labId, CreateReviewRequest request);

    List<LabReviewResponse> getReviewsByLab(Long labId);

    List<LabReviewResponse> getReviewsByUser(Long userId);

    LabRatingSummary getLabRatingSummary(Long labId);

    LabReviewResponse updateReview(Long reviewId, CreateReviewRequest request);

    void deleteReview(Long reviewId);
}
