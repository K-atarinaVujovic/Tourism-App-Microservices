package com.tourism.tours.dto;

import com.tourism.tours.enums.TransportType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateTourTransportTimeRequest {
    @NotNull(message = "Transport type is required")
    private TransportType transportType;

    @NotNull(message = "Duration is required")
    @Positive(message = "Duration must be positive")
    private Integer durationInMinutes;
}