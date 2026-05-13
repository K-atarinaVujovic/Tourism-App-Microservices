package com.tourism.tours.service;

import com.tourism.tours.dto.CreateTourReviewRequest;
import com.tourism.tours.dto.TourReviewResponse;
import com.tourism.tours.entity.TourReview;
import com.tourism.tours.repository.TourRepository;
import com.tourism.tours.repository.TourReviewRepository;
import com.tourism.tours.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TourReviewService {

    private final TourReviewRepository tourReviewRepository;
    private final TourRepository tourRepository;

    public TourReviewResponse createReview(Long tourId, CreateTourReviewRequest request, CurrentUser user) {
        tourRepository.findById(tourId)
                .orElseThrow(() -> new RuntimeException("Tour not found with id: " + tourId));

        TourReview review = new TourReview();
        review.setTourId(tourId);
        review.setTouristId(user.getId());
        review.setTouristUsername(user.getUsername());
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setVisitedAt(request.getVisitedAt());
        review.setCommentedAt(LocalDateTime.now());
        review.setImageUrls(request.getImageUrls());

        TourReview saved = tourReviewRepository.save(review);
        return mapToResponse(saved);
    }

    public List<TourReviewResponse> getReviewsByTour(Long tourId) {
        return tourReviewRepository.findByTourId(tourId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private TourReviewResponse mapToResponse(TourReview review) {
        return new TourReviewResponse(
                review.getId(),
                review.getTourId(),
                review.getTouristId(),
                review.getTouristUsername(),
                review.getRating(),
                review.getComment(),
                review.getVisitedAt(),
                review.getCommentedAt(),
                review.getImageUrls()
        );
    }
}