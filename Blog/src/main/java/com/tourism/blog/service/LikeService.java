package com.tourism.blog.service;

import com.tourism.blog.entity.Blog;
import com.tourism.blog.entity.Like;
import com.tourism.blog.repository.BlogRepository;
import com.tourism.blog.repository.LikeRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

@Service
public class LikeService {
    private BlogRepository blogRepository;
    private LikeRepository likeRepository;

    public LikeService(BlogRepository blogRepository, LikeRepository likeRepository){
        this.blogRepository = blogRepository;
        this.likeRepository = likeRepository;
    }

    public void likeBlog(Long blogId, Long userId){
        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(() ->new RuntimeException("Blog can not be found with id: " + blogId));

        if(likeRepository.existsByBlogIdAndUserId(blog.getId(), userId)){
            throw new RuntimeException("User already liked this blog.");
        }

        Like like = new Like();

        like.setBlogId(blog.getId());
        like.setUserId(userId);

        likeRepository.save(like);

    }

    @Transactional
    public void unlikeBlog(Long blogId, Long userId){
        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new RuntimeException("Blog not found with id: " + blogId));

        if(!likeRepository.existsByBlogIdAndUserId(blogId, userId)){
            throw new RuntimeException("User has not liked this blog");
        }

        likeRepository.deleteByBlogIdAndUserId(blogId, userId);
    }

    public int countLikes(Long blogId){
        return likeRepository.countByBlogId(blogId);
    }
}
