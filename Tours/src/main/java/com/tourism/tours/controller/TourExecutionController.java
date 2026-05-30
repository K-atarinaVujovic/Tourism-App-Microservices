package com.tourism.tours.controller;

import com.tourism.tours.dto.CheckLocationRequest;
import com.tourism.tours.dto.CheckLocationResult;
import com.tourism.tours.dto.TourExecutionResponse;
import com.tourism.tours.entity.TourExecution;
import com.tourism.tours.security.AuthService;
import com.tourism.tours.security.CurrentUser;
import com.tourism.tours.service.TourExecutionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/tour-executions")
@RequiredArgsConstructor
public class TourExecutionController {
    private final TourExecutionService tourExecutionService;
    private final AuthService authService;

    @PostMapping("/start/{tourId}")
    public ResponseEntity<String> start(@RequestHeader("Authorization") String authorization,
                                @PathVariable Long tourId){
        CurrentUser user = authService.getCurrentUser(authorization);
        String message = tourExecutionService.start(user.getId(), tourId);

        return new ResponseEntity<>(message, HttpStatus.OK);
    }

    @PostMapping("/abandon")
    public ResponseEntity<String> abandon(@RequestHeader("Authorization") String authorization){
        CurrentUser user = authService.getCurrentUser(authorization);
        String message = tourExecutionService.abandon(user.getId());

        return new ResponseEntity<>(message, HttpStatus.OK);

    }

    @PostMapping("/check-location")
    public ResponseEntity<CheckLocationResult> checkLocation(@RequestHeader("Authorization") String authorization,
                                             @RequestBody CheckLocationRequest request){
        CurrentUser user = authService.getCurrentUser(authorization);
        CheckLocationResult result = tourExecutionService.checkLocation(user.getId(), request.lat(), request.lon());
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @GetMapping("/active")
    public ResponseEntity<TourExecutionResponse> get(@RequestHeader("Authorization") String authorization){
        CurrentUser user = authService.getCurrentUser(authorization);
        TourExecutionResponse response = tourExecutionService.get(user.getId());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }


}
