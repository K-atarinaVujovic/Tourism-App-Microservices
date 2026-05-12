package com.tourism.tours.service;

import com.tourism.tours.dto.CreateTourRequest;
import com.tourism.tours.dto.TourResponse;
import com.tourism.tours.entity.Tour;
import com.tourism.tours.enums.TourStatus;
import com.tourism.tours.repository.TourRepository;
import com.tourism.tours.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TourService {
    private TourRepository tourRepository;

    public TourResponse createTour(CreateTourRequest request, CurrentUser user){
        Tour tour = new Tour();

        tour.setAuthorId(user.getId());
        tour.setAuthorUsername(user.getUsername());
        tour.setName(request.getName());
        tour.setDescription(request.getDescription());
        tour.setTags(request.getTags());
        tour.setStatus(TourStatus.DRAFT);
        tour.setPrice(0);

        Tour saved = tourRepository.save(tour);
        return mapToResponse(saved);
    }

    public List<TourResponse> getMyTours(CurrentUser user){
        return tourRepository.findByAuthorId(user.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private TourResponse mapToResponse(Tour tour){
        return new TourResponse(
                tour.getId(),
                tour.getAuthorId(),
                tour.getAuthorUsername(),
                tour.getName(),
                tour.getDescription(),
                tour.getDifficulty(),
                tour.getTags(),
                tour.getStatus(),
                tour.getPrice()
        );
    }
}
