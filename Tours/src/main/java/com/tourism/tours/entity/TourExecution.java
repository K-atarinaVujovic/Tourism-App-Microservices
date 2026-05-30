package com.tourism.tours.entity;

import com.tourism.tours.dto.CheckLocationResult;
import com.tourism.tours.dto.KeyPointCoordinates;
import com.tourism.tours.enums.TourExecutionStatus;
import com.tourism.tours.exception.BadRequestException;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


@Entity
@Table(name = "tourExecutions")
@Getter
@Setter
@NoArgsConstructor
public class TourExecution {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name="tour_id")
    private Tour tour;

    private Long touristId;

    @Enumerated(EnumType.STRING)
    private TourExecutionStatus status;

    private LocalDateTime lastActivity;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "tour_execution_id")
    private List<KeyPointProgress> keyPointProgresses = new ArrayList<>();

    public TourExecution(Long touristId, Tour tour){
        this.tour = tour;
        this.touristId = touristId;
        lastActivity = LocalDateTime.now();
        for(KeyPoint kp : tour.getKeypoints()){
            keyPointProgresses.add(new KeyPointProgress(kp));
        }
    }

    public void start(){
        if(status == TourExecutionStatus.STARTED){
            throw new BadRequestException("Can't start a tour that's already started. Finish it.");
        }
        status = TourExecutionStatus.STARTED;
        reset();
    }

    public void abandon(){
        if(status != TourExecutionStatus.STARTED){
            throw new BadRequestException("Can't abandon a tour that's hasn't started. Giving up already??");
        }
        status = TourExecutionStatus.ABANDONED;
        lastActivity = LocalDateTime.now();
    }

    public void complete(){
        if(status != TourExecutionStatus.STARTED){
            throw new BadRequestException("Can't complete a tour that's hasn't started. No skipping.");
        }
        status = TourExecutionStatus.COMPLETED;
        lastActivity = LocalDateTime.now();
    }

    public CheckLocationResult checkLocation(double lat, double lon){
        if(status != TourExecutionStatus.STARTED){
            throw new BadRequestException("Can't check location for a tour that hasn't started. What are you doing?");
        }

        double threshold = 100;
        lastActivity = LocalDateTime.now();

        for(KeyPoint kp: tour.getKeypoints()){
            if(
                canReachKeyPoint(lat, lon, threshold, kp)
            ){
                reachKeypoint(kp.getId());
            }
        }

        boolean allReached = !keyPointProgresses.isEmpty() && keyPointProgresses.stream()
                .allMatch(KeyPointProgress::wasReached);

        List<Long> reachedKeyPointIds = keyPointProgresses.stream()
                .filter(KeyPointProgress::wasReached)
                .map(kpp -> kpp.getKeyPoint().getId())
                .toList();

        List<KeyPointCoordinates> notYetReached = keyPointProgresses.stream()
                .filter(kpp -> !kpp.wasReached())
                .map(kpp -> new KeyPointCoordinates(
                        kpp.getKeyPoint().getLatitude(),
                        kpp.getKeyPoint().getLongitude()))
                .toList();


        if(allReached){
            complete();
        }

        return new CheckLocationResult(reachedKeyPointIds, notYetReached, allReached);
    }

    public void reachKeypoint(Long keyPointId){
        KeyPointProgress progress = keyPointProgresses.stream()
                .filter(kpp -> kpp.getKeyPoint().getId().equals(keyPointId))
                .findFirst()
                .orElseThrow(() -> new BadRequestException("KeyPoint not found in this execution"));

        progress.reach();
    }

    public void reset(){
        lastActivity = LocalDateTime.now();
        for(KeyPointProgress kpp : keyPointProgresses){
            kpp.reset();
        }
    }

    private boolean canReachKeyPoint(double lat, double lon, double threshold, KeyPoint kp) {
        boolean isInRange = isWithinRange(lat, lon, kp.getLatitude(), kp.getLongitude(), threshold);
        if (!isInRange) return false;

        return keyPointProgresses.stream()
                .filter(kpp -> kpp.getKeyPoint().getId().equals(kp.getId()))
                .findFirst()
                .map(kpp -> !kpp.wasReached())
                .orElse(false);
    }

    private boolean isWithinRange(double userLat, double userLon,
                                        double kpLat, double kpLon,
                                        double thresholdMeters) {
        final int EARTH_RADIUS = 6371000; // meters

        double dLat = Math.toRadians(kpLat - userLat);
        double dLon = Math.toRadians(kpLon - userLon);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(userLat)) * Math.cos(Math.toRadians(kpLat))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double distance = EARTH_RADIUS * c;

        return distance <= thresholdMeters;
    }
}
