package com.tourism.tours.service;

import com.tourism.tours.dto.CreateTourTransportTimeRequest;
import com.tourism.tours.dto.TourTransportTimeResponse;
import com.tourism.tours.entity.Tour;
import com.tourism.tours.entity.TourTransportTime;
import com.tourism.tours.repository.TourRepository;
import com.tourism.tours.repository.TourTransportTimeRepository;
import com.tourism.tours.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TourTransportTimeService {
    private final TourTransportTimeRepository repository;
    private final TourRepository tourRepository;

    public TourTransportTimeResponse create(Long tourId, CreateTourTransportTimeRequest request, CurrentUser user) {
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new RuntimeException("Tour not found"));

        if (!tour.getAuthorId().equals(user.getId())) {
            throw new RuntimeException("Only tour author can add transport times");
        }

        TourTransportTime time = new TourTransportTime();
        time.setTourId(tourId);
        time.setTransportType(request.getTransportType());
        time.setDurationInMinutes(request.getDurationInMinutes());

        return mapToResponse(repository.save(time));
    }

    public List<TourTransportTimeResponse> getByTour(Long tourId) {
        return repository.findByTourId(tourId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private TourTransportTimeResponse mapToResponse(TourTransportTime time) {
        return new TourTransportTimeResponse(
                time.getId(),
                time.getTourId(),
                time.getTransportType(),
                time.getDurationInMinutes()
        );
    }
}