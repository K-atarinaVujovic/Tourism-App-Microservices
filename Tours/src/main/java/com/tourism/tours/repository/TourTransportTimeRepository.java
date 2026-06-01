package com.tourism.tours.repository;

import com.tourism.tours.entity.TourTransportTime;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TourTransportTimeRepository extends JpaRepository<TourTransportTime, Long> {
    List<TourTransportTime> findByTourId(Long tourId);
    boolean existsByTourId(Long tourId);
}