package com.tourism.tours.repository;

import com.tourism.tours.entity.Tour;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

import java.util.List;

public interface TourRepository extends JpaRepository<Tour, Long> {
    List<Tour> findByAuthorId(Long authorId);
    Optional<Tour> findById(Long id);
}