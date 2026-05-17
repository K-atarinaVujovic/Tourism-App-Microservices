package com.tourism.tours.controller;

import com.tourism.tours.dto.CreateKeyPointRequest;
import com.tourism.tours.dto.KeyPointResponse;
import com.tourism.tours.dto.UpdateKeyPointRequest;
import com.tourism.tours.security.AuthService;
import com.tourism.tours.security.CurrentUser;
import com.tourism.tours.service.KeyPointService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tours/{tourId}/key-points")
@RequiredArgsConstructor
public class KeyPointController {

    private final KeyPointService keyPointService;
    private final AuthService authService;

    @PostMapping
    public KeyPointResponse createKeyPoint(@PathVariable Long tourId,
                                           @RequestHeader("Authorization") String authorization,
                                           @Valid @RequestBody CreateKeyPointRequest request) {
        CurrentUser user = authService.getCurrentUser(authorization);
        return keyPointService.createKeyPoint(tourId, request, user);
    }

    @GetMapping
    public List<KeyPointResponse> getKeyPoints(@PathVariable Long tourId) {
        return keyPointService.getKeyPoints(tourId);
    }

    @PutMapping("/{keyPointId}")
    public KeyPointResponse updateKeyPoint(@PathVariable Long tourId,
                                           @PathVariable Long keyPointId,
                                           @RequestHeader("Authorization") String authorization,
                                           @Valid @RequestBody UpdateKeyPointRequest request) {
        CurrentUser user = authService.getCurrentUser(authorization);
        return keyPointService.updateKeyPoint(tourId, keyPointId, request, user);
    }

    @DeleteMapping("/{keyPointId}")
    public void deleteKeyPoint(@PathVariable Long tourId,
                               @PathVariable Long keyPointId,
                               @RequestHeader("Authorization") String authorization) {
        CurrentUser user = authService.getCurrentUser(authorization);
        keyPointService.deleteKeyPoint(tourId, keyPointId, user);
    }
}