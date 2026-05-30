package com.tourism.tours.repository;

import com.tourism.tours.entity.KeyPoint;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface KeyPointRepository extends JpaRepository<KeyPoint, Long> {
    List<KeyPoint> findByTourId(Long tourId);
    List<KeyPoint> findByTourIdOrderByIdAsc(Long tourId);
    Optional<KeyPoint> findFirstByTourIdOrderByIdAsc(Long tourId);
}