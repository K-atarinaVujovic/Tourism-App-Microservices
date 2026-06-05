package com.tourism.tours.entity;

import com.tourism.tours.enums.TransportType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "tour_transport_times")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TourTransportTime {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long tourId;

    @Enumerated(EnumType.STRING)
    private TransportType transportType;

    private Integer durationInMinutes;
}
