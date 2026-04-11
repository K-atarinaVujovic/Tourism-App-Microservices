package com.tourism.blog.dto;

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
public class BlogResponse {     //be vraca kao odgovor za blog
    private Long id;
    private Long authorId;
    private String title;
    private String description;
    private LocalDateTime cratedAt;
    private List<String> imageUrls;
    private int likeCount;
}
