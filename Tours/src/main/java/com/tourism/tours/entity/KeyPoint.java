package com.tourism.tours.entity;

import com.tourism.tours.enums.KeyPointType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "key_points")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class KeyPoint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name="tour_id")
    private Tour tour;

    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private KeyPointType type;

    private String imageUrl;

    private double latitude;

    private double longitude;
}