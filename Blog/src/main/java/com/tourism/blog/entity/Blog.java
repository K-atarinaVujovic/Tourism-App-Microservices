package com.tourism.blog.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Blog {
    @Getter
    private Long id;
    private Long authorId;
    private String title;
    private String description;
    private LocalDateTime createdAt;
    private List<String> imageUrls;
}
