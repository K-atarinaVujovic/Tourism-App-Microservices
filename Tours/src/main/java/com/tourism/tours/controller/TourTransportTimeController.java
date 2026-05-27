package com.tourism.tours.controller;

import com.tourism.tours.dto.CreateTourTransportTimeRequest;
import com.tourism.tours.dto.TourTransportTimeResponse;
import com.tourism.tours.security.AuthService;
import com.tourism.tours.security.CurrentUser;
import com.tourism.tours.service.TourTransportTimeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tours/{tourId}/transport-times")
@RequiredArgsConstructor
public class TourTransportTimeController {
    private final TourTransportTimeService service;
    private final AuthService authService;

    @PostMapping
    public TourTransportTimeResponse create(@PathVariable Long tourId,
                                            @RequestHeader("Authorization") String authorization,
                                            @Valid @RequestBody CreateTourTransportTimeRequest request) {
        CurrentUser user = authService.getCurrentUser(authorization);
        return service.create(tourId, request, user);
    }

    @GetMapping
    public List<TourTransportTimeResponse> getByTour(@PathVariable Long tourId) {
        return service.getByTour(tourId);
    }
}