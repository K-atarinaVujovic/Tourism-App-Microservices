package com.tourism.tours.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "tour_reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TourReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long tourId;

    private Long touristId;
    private String touristUsername;

    private int rating;

    @Column(columnDefinition = "TEXT")
    private String comment;

    private LocalDate visitedAt;

    private LocalDateTime commentedAt;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "tour_review_images", joinColumns = @JoinColumn(name = "review_id"))
    @Column(name = "image_url")
    private List<String> imageUrls;
}