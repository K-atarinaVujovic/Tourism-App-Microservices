package com.follower.service;

import com.follower.domain.User;
import com.follower.dto.BlogDTO;
import com.follower.dto.UserDTO;
import com.follower.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@Transactional
public class FollowerService {

    private final UserRepository userRepository;
    private final WebClient stakeholdersClient;
    private final WebClient blogClient;

    public FollowerService(
            UserRepository userRepository,
            @Qualifier("stakeholdersClient") WebClient stakeholdersClient,
            @Qualifier("blogClient") WebClient blogClient) {
        this.userRepository = userRepository;
        this.stakeholdersClient = stakeholdersClient;
        this.blogClient = blogClient;
    }

    // ============ Follow / Unfollow ============

    public void followUser(Long followerId, Long followingId) {
        log.info("User {} is following user {}", followerId, followingId);

        if (followerId.equals(followingId)) {
            throw new RuntimeException("A user cannot follow themselves!");
        }

        // Ensure both users exist in the external Stakeholders service
        fetchUserProfile(followerId);
        fetchUserProfile(followingId);

        // Upsert both nodes in Neo4j, then create the FOLLOWS edge
        User follower = userRepository.findByUserId(followerId)
                .orElseGet(() -> userRepository.save(User.builder().userId(followerId).build()));

        User following = userRepository.findByUserId(followingId)
                .orElseGet(() -> userRepository.save(User.builder().userId(followingId).build()));

        follower.getFollowing().add(following);
        userRepository.save(follower);

        log.info("FOLLOWS relationship created: {} -> {}", followerId, followingId);
    }

    public void unfollowUser(Long followerId, Long followingId) {
        log.info("User {} is unfollowing user {}", followerId, followingId);

        User follower = userRepository.findByUserId(followerId)
                .orElseThrow(() -> new RuntimeException("User " + followerId + " not found"));

        User following = userRepository.findByUserId(followingId)
                .orElseThrow(() -> new RuntimeException("User " + followingId + " not found"));

        follower.getFollowing().remove(following);
        userRepository.save(follower);

        log.info("FOLLOWS relationship removed: {} -> {}", followerId, followingId);
    }

    // ============ Feed — blogs from followed users ============

    public List<BlogDTO> getFollowingUsersBlogsWithPagination(Long userId, int limit) {
        log.info("Fetching blog feed for user {}, limit {}", userId, limit);

        List<Long> followedIds = userRepository.findFollowingIds(userId);

        return followedIds.stream()
                .flatMap(authorId -> fetchBlogsByAuthor(authorId).stream())
                .limit(limit)
                .collect(Collectors.toList());
    }

    public List<BlogDTO> getFollowingUsersBlogs(Long userId) {
        log.info("Fetching all blogs for user {}", userId);

        List<Long> followedIds = userRepository.findFollowingIds(userId);

        return followedIds.stream()
                .flatMap(authorId -> fetchBlogsByAuthor(authorId).stream())
                .collect(Collectors.toList());
    }

    // ============ Recommendations — friends of friends ============

    public List<UserDTO> getRecommendedUsers(Long userId, int limit) {
        log.info("Getting follow recommendations for user {}", userId);

        List<User> recommended = userRepository.findRecommendedUsers(userId, limit);

        return recommended.stream()
                .map(u -> fetchUserProfile(u.getUserId()))
                .collect(Collectors.toList());
    }

    // ============ Graph info ============

    public List<UserDTO> getFollowing(Long userId) {
        List<User> following = userRepository.findFollowing(userId);
        return following.stream()
                .map(u -> fetchUserProfile(u.getUserId()))
                .collect(Collectors.toList());
    }

    public List<UserDTO> getFollowers(Long userId) {
        List<User> followers = userRepository.findFollowers(userId);
        return followers.stream()
                .map(u -> fetchUserProfile(u.getUserId()))
                .collect(Collectors.toList());
    }

    public Boolean isFollowing(Long userId1, Long userId2) {
        return userRepository.isFollowing(userId1, userId2);
    }

    public UserDTO getUserById(Long userId) {
        return fetchUserProfile(userId);
    }

    // ============ Remote calls ============

    private UserDTO fetchUserProfile(Long userId) {
        try {
            return stakeholdersClient.get()
                    .uri("/profiles/{id}", userId)
                    .retrieve()
                    .bodyToMono(UserDTO.class)
                    .block();
        } catch (WebClientResponseException.NotFound e) {
            throw new RuntimeException("User " + userId + " not found in Stakeholders service");
        } catch (Exception e) {
            log.error("Error fetching user {} from Stakeholders service", userId, e);
            throw new RuntimeException("Could not reach Stakeholders service: " + e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    private List<BlogDTO> fetchBlogsByAuthor(Long authorId) {
        try {
            // Blog microservice doesn't expose /blogs/author/{id} yet,
            // so we fetch all and filter — swap for a dedicated endpoint if added later
            List<BlogDTO> all = blogClient.get()
                    .uri("/blogs")
                    .retrieve()
                    .bodyToFlux(BlogDTO.class)
                    .collectList()
                    .block();

            if (all == null) return List.of();
            return all.stream()
                    .filter(b -> authorId.equals(b.getAuthorId()))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching blogs for author {} from Blog service", authorId, e);
            return List.of();
        }
    }
}