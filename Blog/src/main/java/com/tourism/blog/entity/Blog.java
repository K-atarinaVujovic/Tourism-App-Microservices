package com.tourism.blog.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "blogs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Blog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long authorId;
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;
    private LocalDateTime createdAt;

    @ElementCollection      //posebna tabela
    @CollectionTable(name = "blog_images", joinColumns = @JoinColumn(name = "blog_id"))
    @Column(name = "image_url")
    private List<String> imageUrls;
}
