package com.tourism.tours.dto;

import com.tourism.tours.entity.Tour;
import com.tourism.tours.enums.TourExecutionStatus;

import java.time.LocalDateTime;
import java.util.List;

public record TourExecutionResponse(
        Long id,
        Long tourId,
        Long touristId,
        TourExecutionStatus status,
        LocalDateTime lastActivity,
        List<KeyPointProgressResponse> keyPointProgresses,
        TourExecutionTourInfo tour
) {}