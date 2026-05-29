package com.tourism.tours.entity;

import com.tourism.tours.enums.KeyPointProgress;
import com.tourism.tours.enums.TourExecutionStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Date;
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

    @Enumerated(EnumType.STRING)
    private TourExecutionStatus status;

    private LocalDate lastActivity;

    @OneToMany(mappedBy = "tourExecution", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<KeyPointProgress> keyPointProgresses = new ArrayList<>();

    public TourExecution(Tour tour){
        this.tour = tour;
        status = TourExecutionStatus.STARTED;
        lastActivity = LocalDate.now();
        for(KeyPoint kp : tour.getKeypoints()){
            keyPointProgresses.add(new KeyPointProgress(kp));
        }
    }


}
