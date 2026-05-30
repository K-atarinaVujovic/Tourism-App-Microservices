package com.tourism.tours.dto;

import com.tourism.tours.entity.KeyPoint;

import java.util.List;

public record CheckLocationResult(List<Long> reachedKeyPointIds, List<KeyPointCoordinates> notYetReachedKeyPoints, boolean tourCompleted) {}
