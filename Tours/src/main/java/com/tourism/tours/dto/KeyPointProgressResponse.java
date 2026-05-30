package com.tourism.tours.dto;

import java.time.LocalDateTime;

public record KeyPointProgressResponse(
    Long keyPointId,
    LocalDateTime timeReached,
    boolean reached
) {}