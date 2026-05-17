package com.tourism.tours.dto;

import com.tourism.tours.enums.TourDifficulty;
import com.tourism.tours.enums.TourStatus;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TourResponse {
    private Long id;
    private Long authorId;
    private String authorUsername;
    private String name;
    private String description;
    private TourDifficulty difficulty;
    private List<String> tags;
    private TourStatus status;
    private double price;
}