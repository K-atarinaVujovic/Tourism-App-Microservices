package com.tourism.tours.repository;

import com.tourism.tours.entity.KeyPoint;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface KeyPointRepository extends JpaRepository<KeyPoint, Long> {
    List<KeyPoint> findByTourId(Long tourId);
}