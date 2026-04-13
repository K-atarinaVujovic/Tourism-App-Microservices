package com.tourism.blog.dto;

import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponse {

    private Long id;
    private Long blogId;
    private Long authorId;
    private String authorUsername;
    private String text;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
