package com.follower.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlogDTO {
    private Long id;
    private Long authorId;
    private String title;
    private String description;
    private LocalDateTime cratedAt;
    private List<String> imageUrls;
    private int likeCount;
}