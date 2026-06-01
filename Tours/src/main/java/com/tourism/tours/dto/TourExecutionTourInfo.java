package com.tourism.tours.dto;

import java.util.List;

public record TourExecutionTourInfo(Long tourId, String tourName, List<KeyPointResponse> keyPoints) {}
