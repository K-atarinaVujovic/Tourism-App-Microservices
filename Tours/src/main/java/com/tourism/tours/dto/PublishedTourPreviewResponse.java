package com.tourism.tours.dto;

import com.tourism.tours.enums.TourDifficulty;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PublishedTourPreviewResponse {
    private Long id;
    private String name;
    private String description;
    private TourDifficulty difficulty;
    private List<String> tags;
    private double price;
    private Double lengthInKm;
    private KeyPointResponse firstKeyPoint;
    private List<TourTransportTimeResponse> transportTimes;
}