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
public class UserDTO {
    private Long userId;
    private String username;
    private String email;
    private String fullName;
    private String bio;
    private String profilePictureUrl;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer followersCount;
    private Integer followingCount;
    private Boolean isFollowedByCurrentUser;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
class UserRequestDTO {
    private Long userId;
    private String username;
    private String email;
    private String fullName;
    private String bio;
    private String profilePictureUrl;
}
