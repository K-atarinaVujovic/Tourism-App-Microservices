package com.tourism.tours.dto;

import com.tourism.tours.enums.KeyPointType;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateKeyPointRequest {

    @NotBlank(message = "Key point name is required")
    private String name;

    @NotBlank(message = "Description is required")
    private String description;

    private KeyPointType type;

    private String imageUrl;

    private double latitude;

    private double longitude;
}
