package com.tourism.tours.dto;

import com.tourism.tours.enums.KeyPointType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class KeyPointResponse {
    private Long id;
    private Long tourId;
    private String name;
    private String description;
    private KeyPointType type;
    private String imageUrl;
    private double latitude;
    private double longitude;
}