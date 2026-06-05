package com.tourism.tours.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTourLengthRequest {

    @NotNull(message = "Length is required")
    @PositiveOrZero(message = "Length must be positive or zero")
    private Double lengthInKm;
}