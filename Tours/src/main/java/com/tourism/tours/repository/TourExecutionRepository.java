package com.tourism.tours.repository;

import com.tourism.tours.entity.TourExecution;
import com.tourism.tours.enums.TourExecutionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TourExecutionRepository extends JpaRepository<TourExecution, Long> {
    Optional<TourExecution> findById(Long id);
    Optional<TourExecution> findByTouristIdAndTourId(Long touristId, Long tourId);
    Optional<TourExecution> findByTouristIdAndStatus(Long touristId, TourExecutionStatus status);
}
