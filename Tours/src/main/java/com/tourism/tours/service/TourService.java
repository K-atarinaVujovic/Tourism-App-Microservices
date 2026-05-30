package com.tourism.tours.service;

import com.tourism.tours.dto.*;
import com.tourism.tours.entity.KeyPoint;
import com.tourism.tours.entity.Tour;
import com.tourism.tours.enums.TourStatus;
import com.tourism.tours.repository.KeyPointRepository;
import com.tourism.tours.repository.TourRepository;
import com.tourism.tours.repository.TourTransportTimeRepository;
import com.tourism.tours.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import com.tourism.tours.entity.TourTransportTime;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TourService {
    private final TourRepository tourRepository;
    private final StakeholdersClient stakeholdersClient;
    private final KeyPointRepository keyPointRepository;
    private final TourTransportTimeRepository transportTimeRepository;

    public TourResponse createTour(CreateTourRequest request, CurrentUser user, String authorization){
        String role = stakeholdersClient.getUserRole(user.getId(), authorization);

        if (!"author".equals(role)) {
            throw new RuntimeException("Only authors can create tours");
        }

        Tour tour = new Tour();

        tour.setAuthorId(user.getId());
        tour.setAuthorUsername(user.getUsername());
        tour.setName(request.getName());
        tour.setDescription(request.getDescription());
        tour.setDifficulty(request.getDifficulty());
        tour.setTags(request.getTags());
        tour.setStatus(TourStatus.DRAFT);
        tour.setPrice(0);

        Tour saved = tourRepository.save(tour);

        log.info("Tour {} created", saved.getId());
        return mapToResponse(saved);
    }

    public List<TourResponse> getMyTours(CurrentUser user){
        return tourRepository.findByAuthorId(user.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<TourResponse> getAllTours(){
        return tourRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public TourResponse getTourById(Long id) {
        return tourRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Tour not found"));
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
                tour.getPrice(),
                tour.getLengthInKm(),
                tour.getPublishedAt(),
                tour.getArchivedAt()
        );
    }

    public TourResponse updateTourLength(Long tourId, UpdateTourLengthRequest request, CurrentUser user) {
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new RuntimeException("Tour not found"));

        if (!tour.getAuthorId().equals(user.getId())) {
            throw new RuntimeException("Only tour author can update tour length");
        }

        tour.setLengthInKm(request.getLengthInKm());

        return mapToResponse(tourRepository.save(tour));
    }

    public TourResponse publishTour(Long tourId, CurrentUser user) {
        Tour tour = getTourAndCheckAuthor(tourId, user);

        if (tour.getStatus() != TourStatus.DRAFT) {
            throw new RuntimeException("Only draft tours can be published");
        }

        validatePublishConditions(tour);

        tour.setStatus(TourStatus.PUBLISHED);
        tour.setPublishedAt(LocalDateTime.now());
        tour.setArchivedAt(null);

        return mapToResponse(tourRepository.save(tour));
    }

    public TourResponse archiveTour(Long tourId, CurrentUser user) {
        Tour tour = getTourAndCheckAuthor(tourId, user);

        if (tour.getStatus() != TourStatus.PUBLISHED) {
            throw new RuntimeException("Only published tours can be archived");
        }

        tour.setStatus(TourStatus.ARCHIVED);
        tour.setArchivedAt(LocalDateTime.now());

        return mapToResponse(tourRepository.save(tour));
    }

    public TourResponse reactivateTour(Long tourId, CurrentUser user) {
        Tour tour = getTourAndCheckAuthor(tourId, user);

        if (tour.getStatus() != TourStatus.ARCHIVED) {
            throw new RuntimeException("Only archived tours can be reactivated");
        }

        tour.setStatus(TourStatus.PUBLISHED);
        tour.setArchivedAt(null);

        return mapToResponse(tourRepository.save(tour));
    }

    private Tour getTourAndCheckAuthor(Long tourId, CurrentUser user) {
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new RuntimeException("Tour not found"));

        if (!tour.getAuthorId().equals(user.getId())) {
            throw new RuntimeException("Only tour author can manage this tour");
        }

        return tour;
    }

    private void validatePublishConditions(Tour tour) {
        if (isBlank(tour.getName()) || isBlank(tour.getDescription()) || tour.getDifficulty() == null) {
            throw new RuntimeException("Tour must contain name, description and difficulty");
        }

        if (tour.getTags() == null || tour.getTags().isEmpty()) {
            throw new RuntimeException("Tour must contain at least one tag");
        }

        int keyPointCount = keyPointRepository.findByTourId(tour.getId()).size();

        if (keyPointCount < 2) {
            throw new RuntimeException("Tour must contain at least two key points");
        }

        if (!transportTimeRepository.existsByTourId(tour.getId())) {
            throw new RuntimeException("Tour must contain at least one transport time");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    public List<PublishedTourPreviewResponse> getPublishedToursPreview() {
        return tourRepository.findByStatus(TourStatus.PUBLISHED)
                .stream()
                .map(this::mapToPublishedPreview)
                .toList();
    }

    private PublishedTourPreviewResponse mapToPublishedPreview(Tour tour) {
        KeyPointResponse firstKeyPoint = keyPointRepository.findFirstByTourIdOrderByIdAsc(tour.getId())
                .map(this::mapKeyPointToResponse)
                .orElse(null);

        List<TourTransportTimeResponse> transportTimes = transportTimeRepository.findByTourId(tour.getId())
                .stream()
                .map(this::mapTransportTimeToResponse)
                .toList();

        return new PublishedTourPreviewResponse(
                tour.getId(),
                tour.getName(),
                tour.getDescription(),
                tour.getDifficulty(),
                tour.getTags(),
                tour.getPrice(),
                tour.getLengthInKm(),
                firstKeyPoint,
                transportTimes
        );
    }

    private KeyPointResponse mapKeyPointToResponse(KeyPoint keyPoint) {
        return new KeyPointResponse(
                keyPoint.getId(),
                keyPoint.getTour().getId(),
                keyPoint.getName(),
                keyPoint.getDescription(),
                keyPoint.getType(),
                keyPoint.getImageUrl(),
                keyPoint.getLatitude(),
                keyPoint.getLongitude()
        );
    }

    private TourTransportTimeResponse mapTransportTimeToResponse(TourTransportTime time) {
        return new TourTransportTimeResponse(
                time.getId(),
                time.getTourId(),
                time.getTransportType(),
                time.getDurationInMinutes()
        );
    }
}
