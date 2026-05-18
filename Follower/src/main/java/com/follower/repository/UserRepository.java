package com.follower.repository;

import com.follower.domain.User;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends Neo4jRepository<User, Long> {

    @Query("MATCH (u:User {userId: $userId}) RETURN u")
    Optional<User> findByUserId(Long userId);

    @Query("MATCH (u:User {userId: $userId})-[:FOLLOWS]->(following:User) RETURN following")
    List<User> findFollowing(Long userId);

    @Query("MATCH (follower:User)-[:FOLLOWS]->(u:User {userId: $userId}) RETURN follower")
    List<User> findFollowers(Long userId);

    @Query("""
        MATCH (u:User {userId: $userId})-[:FOLLOWS]->(friend:User)-[:FOLLOWS]->(recommendation:User)
        WHERE NOT (u)-[:FOLLOWS]->(recommendation)
        AND recommendation.userId <> $userId
        WITH recommendation, COUNT(DISTINCT friend) AS mutualFollows
        RETURN recommendation
        ORDER BY mutualFollows DESC
        LIMIT $limit
        """)
    List<User> findRecommendedUsers(Long userId, int limit);

    @Query("MATCH (u1:User {userId: $userId1})-[:FOLLOWS]->(u2:User {userId: $userId2}) RETURN COUNT(*) > 0")
    Boolean isFollowing(Long userId1, Long userId2);

    @Query("""
        MATCH (user:User {userId: $userId})-[:FOLLOWS]->(followed:User)
        RETURN followed.userId
        """)
    List<Long> findFollowingIds(Long userId);

    @Query("MATCH (a:User {userId: $followerId})-[r:FOLLOWS]->(b:User {userId: $followingId}) DELETE r")
    void deleteFollowRelationship(Long followerId, Long followingId);
}