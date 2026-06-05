package com.tourism.tours.dto;

import com.tourism.tours.enums.TransportType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TourTransportTimeResponse {
    private Long id;
    private Long tourId;
    private TransportType transportType;
    private Integer durationInMinutes;
}