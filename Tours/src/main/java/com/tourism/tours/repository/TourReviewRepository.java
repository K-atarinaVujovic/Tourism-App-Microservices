package com.tourism.tours.repository;

import com.tourism.tours.entity.TourReview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TourReviewRepository extends JpaRepository<TourReview, Long> {
    List<TourReview> findByTourId(Long tourId);
}