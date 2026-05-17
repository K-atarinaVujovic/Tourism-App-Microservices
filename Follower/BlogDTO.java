package com.follower.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlogDTO {
    private Long blogId;
    private String title;
    private String content;
    private String summary;
    private UserDTO author;
    private LocalDateTime publishedAt;
    private LocalDateTime updatedAt;
    private Boolean isPublished;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
class CreateBlogRequestDTO {
    private String title;
    private String content;
    private String summary;
    private Long authorId;
}
