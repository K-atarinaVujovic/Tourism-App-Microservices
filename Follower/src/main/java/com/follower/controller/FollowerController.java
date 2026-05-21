package com.follower.controller;

import com.follower.dto.BlogDTO;
import com.follower.dto.UserDTO;
import com.follower.security.CurrentUser;
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
    private final CurrentUser currentUser;

    // POST /followers/follow/{followingId}
    @PostMapping("/follow/{followingId}")
    public ResponseEntity<String> followUser(@PathVariable Long followingId) {
        long followerId = currentUser.getUserId();
        log.info("Request: user {} follows user {}", followerId, followingId);
        try {
            followerService.followUser(followerId, followingId);
            return ResponseEntity.ok("User followed successfully!");
        } catch (RuntimeException e) {
            log.error("Error following user", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: " + e.getMessage());
        }
    }

    // DELETE /followers/unfollow/{followingId}
    @DeleteMapping("/unfollow/{followingId}")
    public ResponseEntity<String> unfollowUser(@PathVariable Long followingId) {
        long followerId = currentUser.getUserId();
        log.info("Request: user {} unfollows user {}", followerId, followingId);
        try {
            followerService.unfollowUser(followerId, followingId);
            return ResponseEntity.ok("User unfollowed successfully!");
        } catch (RuntimeException e) {
            log.error("Error unfollowing user", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: " + e.getMessage());
        }
    }

    // GET /followers/feed?limit=20
    @GetMapping("/feed")
    public ResponseEntity<List<BlogDTO>> getUserFeed(
            @RequestParam(defaultValue = "20") int limit) {
        long userId = currentUser.getUserId();
        log.info("Request: feed for user {}", userId);
        try {
            return ResponseEntity.ok(followerService.getFollowingUsersBlogsWithPagination(userId, limit));
        } catch (RuntimeException e) {
            log.error("Error fetching feed", e);
            return ResponseEntity.notFound().build();
        }
    }

    // GET /followers/all-blogs
    @GetMapping("/all-blogs")
    public ResponseEntity<List<BlogDTO>> getAllFollowingBlogs() {
        long userId = currentUser.getUserId();
        log.info("Request: all blogs for user {}", userId);
        try {
            return ResponseEntity.ok(followerService.getFollowingUsersBlogs(userId));
        } catch (RuntimeException e) {
            log.error("Error fetching blogs", e);
            return ResponseEntity.notFound().build();
        }
    }

    // GET /followers/recommendations?limit=10
    @GetMapping("/recommendations")
    public ResponseEntity<List<UserDTO>> getRecommendations(
            @RequestParam(defaultValue = "10") int limit) {
        long userId = currentUser.getUserId();
        log.info("Request: recommendations for user {}", userId);
        try {
            return ResponseEntity.ok(followerService.getRecommendedUsers(userId, limit));
        } catch (RuntimeException e) {
            log.error("Error fetching recommendations", e);
            return ResponseEntity.notFound().build();
        }
    }

    // GET /followers/following
    @GetMapping("/following")
    public ResponseEntity<List<UserDTO>> getFollowing() {
        long userId = currentUser.getUserId();
        try {
            return ResponseEntity.ok(followerService.getFollowing(userId));
        } catch (RuntimeException e) {
            log.error("Error fetching following", e);
            return ResponseEntity.notFound().build();
        }
    }

    // GET /followers/followers-list
    @GetMapping("/followers-list")
    public ResponseEntity<List<UserDTO>> getFollowers() {
        long userId = currentUser.getUserId();
        try {
            return ResponseEntity.ok(followerService.getFollowers(userId));
        } catch (RuntimeException e) {
            log.error("Error fetching followers", e);
            return ResponseEntity.notFound().build();
        }
    }

    // GET /followers/is-following/{userId2}
    @GetMapping("/is-following/{userId2}")
    public ResponseEntity<Boolean> isFollowing(@PathVariable Long userId2) {
        long userId1 = currentUser.getUserId();
        return ResponseEntity.ok(followerService.isFollowing(userId1, userId2));
    }

    // GET /followers/me
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getMe() {
        long userId = currentUser.getUserId();
        try {
            return ResponseEntity.ok(followerService.getUserById(userId));
        } catch (RuntimeException e) {
            log.error("Error fetching user", e);
            return ResponseEntity.notFound().build();
        }
    }

    // GET /followers/user/{userId} — look up any user by ID
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