package com.follower.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    private Long userId;    // maps to user_id in ProfileResponse
    private String name;
    private String lastname;
    private String imageUrl;
    private String biography;
    private String quote;
    private Integer followersCount;
    private Integer followingCount;
}