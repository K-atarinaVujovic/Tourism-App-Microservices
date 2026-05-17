package com.tourism.tours.controller;

import com.tourism.tours.dto.CreateTourReviewRequest;
import com.tourism.tours.dto.TourReviewResponse;
import com.tourism.tours.security.AuthService;
import com.tourism.tours.security.CurrentUser;
import com.tourism.tours.service.TourReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tours/{tourId}/reviews")
@RequiredArgsConstructor
public class TourReviewController {

    private final TourReviewService tourReviewService;
    private final AuthService authService;

    @PostMapping
    public TourReviewResponse createReview(@PathVariable Long tourId,
                                           @RequestHeader("Authorization") String authorization,
                                           @Valid @RequestBody CreateTourReviewRequest request) {
        CurrentUser user = authService.getCurrentUser(authorization);
        return tourReviewService.createReview(tourId, request, user, authorization);
    }

    @GetMapping
    public List<TourReviewResponse> getReviews(@PathVariable Long tourId) {
        return tourReviewService.getReviewsByTour(tourId);
    }
}