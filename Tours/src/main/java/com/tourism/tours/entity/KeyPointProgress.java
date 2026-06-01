package com.tourism.tours.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "keyPointProgresses")
@Getter
@Setter
@NoArgsConstructor
public class KeyPointProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "key_point_id")
    private KeyPoint keyPoint;

    LocalDateTime timeReached;

    public KeyPointProgress(KeyPoint keyPoint){
        this.keyPoint = keyPoint;
        timeReached = null;
    }

    public boolean wasReached(){
        return timeReached != null;
    }

    public void reach(){
        timeReached = LocalDateTime.now();
    }

    public void reset(){
        timeReached = null;
    }
}
