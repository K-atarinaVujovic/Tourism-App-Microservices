package com.tourism.tours.service;

import com.tourism.tours.dto.*;
import com.tourism.tours.entity.KeyPoint;
import com.tourism.tours.entity.Tour;
import com.tourism.tours.entity.TourExecution;
import com.tourism.tours.enums.TourExecutionStatus;
import com.tourism.tours.exception.BadRequestException;
import com.tourism.tours.repository.TourExecutionRepository;
import com.tourism.tours.repository.TourRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TourExecutionService {
    private final TourRepository tourRepository;
    private final TourExecutionRepository tourExecutionRepository;

    @Transactional
    public String start(Long touristId, Long tourId){
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new BadRequestException("Can't find tour to start!!"));

        tourExecutionRepository.findByTouristIdAndStatus(touristId, TourExecutionStatus.STARTED)
                .ifPresent(active -> {
                    throw new BadRequestException(
                            "You already have an active tour execution for tour " + active.getTour().getId() + ". Finish it first.");
                });

        TourExecution execution = tourExecutionRepository
                .findByTouristIdAndTourId(touristId, tourId)
                .orElseGet(() -> new TourExecution(touristId, tour));
        execution.start();

        tourExecutionRepository.save(execution);

        log.info("Tour execution for tourist {} and tour {}", touristId, tourId);

        return "Tour " + tourId + " started!";
    }

    @Transactional
    public String abandon(Long touristId){
        TourExecution execution = getActiveExecution(touristId);
        execution.abandon();
        tourExecutionRepository.save(execution);
        log.info("Tour execution abandoned for tourist {}", touristId);
        return "Tour abandoned! :(";
    }

    @Transactional
    public CheckLocationResult checkLocation(Long touristId, double lat, double lon){
        TourExecution execution = getActiveExecution(touristId);
        CheckLocationResult result = execution.checkLocation(lat, lon);
        tourExecutionRepository.save(execution);
        log.info("Location checked for tourist {}, newly reached: {}, completed: {}",
                touristId, result.reachedKeyPointIds(), result.tourCompleted());
        return result;
    }

    @Transactional
    public TourExecutionResponse get(Long touristId){
        return mapToResponse(getActiveExecution(touristId));
    }

    private TourExecutionResponse mapToResponse(TourExecution execution) {
        List<KeyPointProgressResponse> progresses = execution.getKeyPointProgresses().stream()
                .map(kpp -> new KeyPointProgressResponse(
                        kpp.getKeyPoint().getId(),
                        kpp.getTimeReached(),
                        kpp.wasReached()
                ))
                .toList();

        List<KeyPointResponse> keypoints = execution.getTour().getKeypoints().stream()
                .map(this::mapToKeyPointResponse)
                .toList();

        TourExecutionTourInfo tourInfo = new TourExecutionTourInfo(
                execution.getTour().getId(),
                execution.getTour().getName(),
                keypoints
        );

        return new TourExecutionResponse(
                execution.getId(),
                execution.getTour().getId(),
                execution.getTouristId(),
                execution.getStatus(),
                execution.getLastActivity(),
                progresses,
                tourInfo
        );
    }

    private TourExecution getExecution(Long touristId, Long tourId){
        return tourExecutionRepository
                .findByTouristIdAndTourId(touristId, tourId)
                .orElseThrow(() -> new BadRequestException(
                        "No execution found for tourist " + touristId + " and tour " + tourId));
    }

    private TourExecution getActiveExecution(Long touristId){
        return tourExecutionRepository
                .findByTouristIdAndStatus(touristId, TourExecutionStatus.STARTED)
                .orElseThrow(() -> new BadRequestException("No active tour execution found"));
    }

    private KeyPointResponse mapToKeyPointResponse(KeyPoint keyPoint) {
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
}
