package com.follower.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    @JsonProperty("user_id")
    private Long userId;
    private String name;
    private String lastname;
    private String imageUrl;
    private String biography;
    private String quote;
    private Integer followersCount;
    private Integer followingCount;
}