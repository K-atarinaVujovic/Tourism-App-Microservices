package com.tourism.tours.controller;

import com.tourism.tours.dto.CreateTourRequest;
import com.tourism.tours.dto.PublishedTourPreviewResponse;
import com.tourism.tours.dto.TourResponse;
import com.tourism.tours.dto.UpdateTourLengthRequest;
import com.tourism.tours.security.AuthService;
import com.tourism.tours.security.CurrentUser;
import com.tourism.tours.service.TourService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tours")
@RequiredArgsConstructor
public class TourController {
    private final TourService tourService;
    private final AuthService authService;

    @PostMapping
    public TourResponse createTour(@RequestHeader("Authorization") String authorization,
                                    @Valid @RequestBody CreateTourRequest request){
        CurrentUser user = authService.getCurrentUser(authorization);
        return tourService.createTour(request, user, authorization);
    }
    @GetMapping("/my")
    public List<TourResponse> getMyTours(@RequestHeader("Authorization") String authorization){
        CurrentUser user = authService.getCurrentUser(authorization);
        return tourService.getMyTours(user);
    }

    @GetMapping("/published")
    public List<PublishedTourPreviewResponse> getPublishedTours() {
        return tourService.getPublishedToursPreview();
    }

    @GetMapping
    public List<TourResponse> getAllTours(@RequestHeader("Authorization") String authorizatio){
        return tourService.getAllTours();
    }

    @GetMapping("/{id}")
    public TourResponse getTourById(@RequestHeader("Authorization") String authorization, @PathVariable Long id){
        return tourService.getTourById(id);
    }

    @PutMapping("/{id}/length")
    public TourResponse updateTourLength(@PathVariable Long id,
                                         @RequestHeader("Authorization") String authorization,
                                         @Valid @RequestBody UpdateTourLengthRequest request) {
        CurrentUser user = authService.getCurrentUser(authorization);
        return tourService.updateTourLength(id, request, user);
    }

    @PutMapping("/{id}/publish")
    public TourResponse publishTour(@PathVariable Long id,
                                    @RequestHeader("Authorization") String authorization) {
        CurrentUser user = authService.getCurrentUser(authorization);
        return tourService.publishTour(id, user);
    }

    @PutMapping("/{id}/archive")
    public TourResponse archiveTour(@PathVariable Long id,
                                    @RequestHeader("Authorization") String authorization) {
        CurrentUser user = authService.getCurrentUser(authorization);
        return tourService.archiveTour(id, user);
    }

    @PutMapping("/{id}/reactivate")
    public TourResponse reactivateTour(@PathVariable Long id,
                                       @RequestHeader("Authorization") String authorization) {
        CurrentUser user = authService.getCurrentUser(authorization);
        return tourService.reactivateTour(id, user);
    }
}
