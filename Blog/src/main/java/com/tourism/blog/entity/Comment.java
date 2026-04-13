package com.tourism.blog.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "comments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long blogId;
    private Long authorId;
    private String authorUsername;

    @Column(columnDefinition = "TEXT")
    private String text;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
