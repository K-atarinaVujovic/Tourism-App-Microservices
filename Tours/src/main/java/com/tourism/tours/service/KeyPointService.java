package com.tourism.tours.service;

import com.tourism.tours.dto.CreateKeyPointRequest;
import com.tourism.tours.dto.KeyPointResponse;
import com.tourism.tours.entity.KeyPoint;
import com.tourism.tours.entity.Tour;
import com.tourism.tours.repository.KeyPointRepository;
import com.tourism.tours.repository.TourRepository;
import com.tourism.tours.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class KeyPointService {

    private final KeyPointRepository keyPointRepository;
    private final TourRepository tourRepository;

    public KeyPointResponse createKeyPoint(Long tourId, CreateKeyPointRequest request, CurrentUser user) {
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new RuntimeException("Tour not found with id: " + tourId));

        if (!tour.getAuthorId().equals(user.getId())) {
            throw new RuntimeException("Only tour author can add key points");
        }

        KeyPoint keyPoint = new KeyPoint();
        keyPoint.setTourId(tourId);
        keyPoint.setName(request.getName());
        keyPoint.setDescription(request.getDescription());
        keyPoint.setImageUrl(request.getImageUrl());
        keyPoint.setLatitude(request.getLatitude());
        keyPoint.setLongitude(request.getLongitude());

        KeyPoint saved = keyPointRepository.save(keyPoint);
        return mapToResponse(saved);
    }

    public List<KeyPointResponse> getKeyPoints(Long tourId) {
        return keyPointRepository.findByTourId(tourId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private KeyPointResponse mapToResponse(KeyPoint keyPoint) {
        return new KeyPointResponse(
                keyPoint.getId(),
                keyPoint.getTourId(),
                keyPoint.getName(),
                keyPoint.getDescription(),
                keyPoint.getType(),
                keyPoint.getImageUrl(),
                keyPoint.getLatitude(),
                keyPoint.getLongitude()
        );
    }
}