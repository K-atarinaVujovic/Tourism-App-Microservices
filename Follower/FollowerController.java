package com.follower.controller;

import com.follower.dto.BlogDTO;
import com.follower.dto.UserDTO;
import com.follower.service.FollowerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/followers")
@RequiredArgsConstructor
@Slf4j
public class FollowerController {

    private final FollowerService followerService;

    @PostMapping("/{followerId}/follow/{followingId}")
    public ResponseEntity<String> followUser(
            @PathVariable Long followerId,
            @PathVariable Long followingId) {
        log.info("Request: user {} follows user {}", followerId, followingId);
        try {
            followerService.followUser(followerId, followingId);
            return ResponseEntity.ok("User followed successfully!");
        } catch (RuntimeException e) {
            log.error("Error following user", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/{followerId}/unfollow/{followingId}")
    public ResponseEntity<String> unfollowUser(
            @PathVariable Long followerId,
            @PathVariable Long followingId) {
        log.info("Request: user {} unfollows user {}", followerId, followingId);
        try {
            followerService.unfollowUser(followerId, followingId);
            return ResponseEntity.ok("User unfollowed successfully!");
        } catch (RuntimeException e) {
            log.error("Error unfollowing user", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/{userId}/feed")
    public ResponseEntity<List<BlogDTO>> getUserFeed(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "20") int limit) {
        log.info("Request: feed for user {}", userId);
        try {
            return ResponseEntity.ok(followerService.getFollowingUsersBlogsWithPagination(userId, limit));
        } catch (RuntimeException e) {
            log.error("Error fetching feed", e);
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{userId}/all-blogs")
    public ResponseEntity<List<BlogDTO>> getAllFollowingBlogs(@PathVariable Long userId) {
        log.info("Request: all blogs for user {}", userId);
        try {
            return ResponseEntity.ok(followerService.getFollowingUsersBlogs(userId));
        } catch (RuntimeException e) {
            log.error("Error fetching blogs", e);
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{userId}/recommendations")
    public ResponseEntity<List<UserDTO>> getRecommendations(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "10") int limit) {
        log.info("Request: recommendations for user {}", userId);
        try {
            return ResponseEntity.ok(followerService.getRecommendedUsers(userId, limit));
        } catch (RuntimeException e) {
            log.error("Error fetching recommendations", e);
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{userId}/following")
    public ResponseEntity<List<UserDTO>> getFollowing(@PathVariable Long userId) {
        try {
            return ResponseEntity.ok(followerService.getFollowing(userId));
        } catch (RuntimeException e) {
            log.error("Error fetching following", e);
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{userId}/followers")
    public ResponseEntity<List<UserDTO>> getFollowers(@PathVariable Long userId) {
        try {
            return ResponseEntity.ok(followerService.getFollowers(userId));
        } catch (RuntimeException e) {
            log.error("Error fetching followers", e);
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{userId1}/is-following/{userId2}")
    public ResponseEntity<Boolean> isFollowing(
            @PathVariable Long userId1,
            @PathVariable Long userId2) {
        return ResponseEntity.ok(followerService.isFollowing(userId1, userId2));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long userId) {
        try {
            return ResponseEntity.ok(followerService.getUserById(userId));
        } catch (RuntimeException e) {
            log.error("Error fetching user", e);
            return ResponseEntity.notFound().build();
        }
    }
}