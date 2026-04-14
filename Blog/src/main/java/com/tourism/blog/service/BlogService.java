package com.tourism.blog.service;

import com.tourism.blog.BlogApplication;
import com.tourism.blog.dto.BlogResponse;
import com.tourism.blog.dto.CreateBlogRequest;
import com.tourism.blog.entity.Blog;
import com.tourism.blog.repository.BlogRepository;
import com.tourism.blog.repository.LikeRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class BlogService {
    private final BlogRepository blogRepository;
    private final LikeRepository likeRepository;

    public BlogService(BlogRepository blogRepository, LikeRepository likeRepository){
        this.blogRepository = blogRepository;
        this.likeRepository = likeRepository;
    }

    public BlogResponse createBlog(CreateBlogRequest request){
        Blog blog = new Blog();

        blog.setAuthorId(request.getAuthorId());        //kreira ko je autor iz requesta koji je autor napravio
        blog.setTitle(request.getTitle());
        blog.setDescription(request.getDescription());
        blog.setCreatedAt(LocalDateTime.now());
        blog.setImageUrls(request.getImageUrls());

        Blog savedBlog = blogRepository.save(blog);

        return mapToResponse(savedBlog);
    }

    public List<BlogResponse> getAllBlogs(){
        return blogRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public BlogResponse getBlogById(Long id){
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog not found with id: " + id));
        return mapToResponse(blog);
    }

    public BlogResponse mapToResponse(Blog blog){
        return new BlogResponse(
                blog.getId(),
                blog.getAuthorId(),
                blog.getTitle(),
                blog.getDescription(),
                blog.getCreatedAt(),
                blog.getImageUrls(),
                likeRepository.countByBlogId(blog.getId())
        );
    }

}
