package com.tourism.tours.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TourReviewResponse {
    private Long id;
    private Long tourId;
    private Long touristId;
    private String touristUsername;
    private int rating;
    private String comment;
    private LocalDate visitedAt;
    private LocalDateTime commentedAt;
    private List<String> imageUrls;
}