package com.tourism.tours.enums;

import com.tourism.tours.entity.KeyPoint;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

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

    LocalDate timeReached;

    public KeyPointProgress(KeyPoint keyPoint){
        this.keyPoint = keyPoint;
        timeReached = null;
    }
}
