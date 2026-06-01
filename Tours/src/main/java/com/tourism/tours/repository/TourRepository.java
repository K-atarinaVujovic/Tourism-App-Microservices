package com.tourism.tours.repository;

import com.tourism.tours.entity.Tour;
import com.tourism.tours.enums.TourStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

import java.util.List;

public interface TourRepository extends JpaRepository<Tour, Long> {
    List<Tour> findByAuthorId(Long authorId);
    Optional<Tour> findById(Long id);
    List<Tour> findByStatus(TourStatus status);
}