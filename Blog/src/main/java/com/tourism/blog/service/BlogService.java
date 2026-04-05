package com.tourism.blog.service;

import com.tourism.blog.BlogApplication;
import com.tourism.blog.dto.BlogResponse;
import com.tourism.blog.dto.CreateBlogRequest;
import com.tourism.blog.entity.Blog;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class BlogService {
    private final List<Blog> blogs = new ArrayList<>();
    private Long nextId = 1L;

    public BlogResponse createBlog(CreateBlogRequest request){
        Blog blog = new Blog();

        blog.setId(nextId++);       //kreira id, prosledjujemo next
        blog.setAuthorId(request.getAuthorId());        //kreira ko je autor iz requesta koji je autor napravio
        blog.setTitle(request.getTitle());
        blog.setDescription(request.getDescription());
        blog.setCreatedAt(LocalDateTime.now());
        blog.setImageUrls(request.getImageUrls());

        blogs.add(blog);

        return new BlogResponse(
                blog.getId(),
                blog.getAuthorId(),
                blog.getTitle(),
                blog.getDescription(),
                blog.getCreatedAt(),
                blog.getImageUrls(),
                0
        );
    }

    public List<BlogResponse> getAllBlogs(){
        List<BlogResponse> result = new ArrayList<>();

        for(Blog blog : blogs){
            BlogResponse response = new BlogResponse(
                    blog.getId(),
                    blog.getAuthorId(),
                    blog.getTitle(),
                    blog.getDescription(),
                    blog.getCreatedAt(),
                    blog.getImageUrls(),
                    0
            );
            result.add(response);
        }
        return result;
    }

}
