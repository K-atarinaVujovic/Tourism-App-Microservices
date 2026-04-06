package com.tourism.blog.repository;

import com.tourism.blog.entity.Like;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LikeRepository extends JpaRepository<Like, Long> {
    boolean existsByBlogIdAndUserId(Long blogId, Long userId);
    void deleteByBlogIdAndUserId(Long blogId, Long userId);
    int countByBlogId(Long blogId);

}
